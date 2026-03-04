
import os
from dataclasses import dataclass
from typing import Any, Dict, Iterable, Optional, Sequence
from pymongo import MongoClient, ASCENDING
from pymongo.collection import Collection
from pymongo.errors import DuplicateKeyError

MONGO_URI       = os.environ.get("MONGO_URI")
DB_NAME         = "wms_validator"
COLLECTION_NAME = "schemas"


@dataclass
class WriteOutcome:
    status: str               # inserted | updated | upserted | duplicate | deleted | noop
    inserted_id: Optional[Any] = None
    matched_existing_id: Optional[Any] = None
    raw_result: Optional[Dict[str, Any]] = None


class MongoStore:
    def __init__(
        self,
        indexes: Optional[Sequence[Dict[str, Any]]] = None,
        duplicate_handler=None,
        client: Optional[MongoClient] = None,
    ):
        self.client = MongoClient(MONGO_URI)
        self.db = self.client[DB_NAME]
        self.collection: Collection = self.db[COLLECTION_NAME]
        self.duplicate_handler = duplicate_handler
        if indexes:
            self._ensure_indexes(indexes)
    
    @property
    def schemas(self):
        return self.db["schemas"]
    
    @property
    def binat(self):
        # Minutes of Meeting (MoM) collection
        return self.db["binat"]
    
    def insert_one(self, doc: Dict[str, Any]) -> WriteOutcome:
        try:
            res = self.collection.insert_one(doc)
            return WriteOutcome(status="inserted", inserted_id=res.inserted_id)
        except DuplicateKeyError as exc:
            existing = self.collection.find_one({k: v for k, v in doc.items() if k != "_id"})
            if self.duplicate_handler:
                self.duplicate_handler(doc, existing, exc)
            return WriteOutcome(
                status="duplicate",
                matched_existing_id=existing.get("_id") if existing else None,
            )

    def upsert_one(
        self,
        query: Dict[str, Any],
        update: Dict[str, Any],
        set_on_insert: Optional[Dict[str, Any]] = None,
    ) -> WriteOutcome:
        update_doc = {
            "$set": update,
        }
        if set_on_insert:
            update_doc["$setOnInsert"] = set_on_insert

        res = self.collection.update_one(query, update_doc, upsert=True)
        if res.upserted_id is not None:
            return WriteOutcome(status="upserted", inserted_id=res.upserted_id, raw_result=res.raw_result)
        if res.matched_count > 0:
            return WriteOutcome(status="updated", raw_result=res.raw_result)
        return WriteOutcome(status="noop", raw_result=res.raw_result)

    def delete_many(self, query: Dict[str, Any]) -> WriteOutcome:
        res = self.collection.delete_many(query)
        return WriteOutcome(status="deleted", raw_result={"deleted_count": res.deleted_count})

    def find(self, query: Dict[str, Any]) -> Iterable[Dict[str, Any]]:
        return self.collection.find(query)
