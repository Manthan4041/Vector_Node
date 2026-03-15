# main.py — VectorShift backend with DAG validation + Pipeline CRUD API
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Any, Optional, Dict
import uuid
from datetime import datetime

app = FastAPI(title="VectorShift Pipeline API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Models ────────────────────────────────────
class PipelinePayload(BaseModel):
    nodes: List[Any]
    edges: List[Any]


class PipelineSavePayload(BaseModel):
    name: Optional[str] = "Untitled Pipeline"
    nodes: List[Any]
    edges: List[Any]
    nodeIDs: Optional[Dict[str, int]] = {}


class PipelineRecord(BaseModel):
    id: str
    name: str
    nodes: List[Any]
    edges: List[Any]
    nodeIDs: Dict[str, int]
    created_at: str
    updated_at: str
    version: int


# ─── In-memory pipeline store ──────────────────
pipelines_db: Dict[str, PipelineRecord] = {}


# ─── DAG validation ───────────────────────────
def is_dag(nodes: list, edges: list) -> bool:
    """Check if the graph formed by nodes/edges is a Directed Acyclic Graph.
    Uses Kahn's algorithm (topological sort via in-degree counting).
    """
    node_ids = {node["id"] for node in nodes}

    # Build adjacency list and in-degree map
    adj = {nid: [] for nid in node_ids}
    in_degree = {nid: 0 for nid in node_ids}

    for edge in edges:
        src = edge.get("source")
        tgt = edge.get("target")
        if src in node_ids and tgt in node_ids:
            adj[src].append(tgt)
            in_degree[tgt] += 1

    # Kahn's BFS
    queue = [nid for nid, deg in in_degree.items() if deg == 0]
    visited_count = 0

    while queue:
        node = queue.pop(0)
        visited_count += 1
        for neighbor in adj[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    # If we visited all nodes, no cycle exists → it's a DAG
    return visited_count == len(node_ids)


# ─── Routes ───────────────────────────────────

@app.get("/")
def root():
    return {"message": "VectorShift Pipeline API", "version": "2.0"}


@app.post("/pipelines/parse")
def parse_pipeline(payload: PipelinePayload):
    num_nodes = len(payload.nodes)
    num_edges = len(payload.edges)
    dag = is_dag(payload.nodes, payload.edges)

    return {
        "num_nodes": num_nodes,
        "num_edges": num_edges,
        "is_dag": dag,
    }


# ─── Pipeline CRUD ─────────────────────────────

@app.post("/pipelines", status_code=201)
def create_pipeline(payload: PipelineSavePayload):
    pipeline_id = str(uuid.uuid4())[:8]
    now = datetime.utcnow().isoformat()
    record = PipelineRecord(
        id=pipeline_id,
        name=payload.name,
        nodes=payload.nodes,
        edges=payload.edges,
        nodeIDs=payload.nodeIDs,
        created_at=now,
        updated_at=now,
        version=1,
    )
    pipelines_db[pipeline_id] = record
    return record.dict()


@app.get("/pipelines")
def list_pipelines():
    return {
        "pipelines": [
            {
                "id": p.id,
                "name": p.name,
                "node_count": len(p.nodes),
                "edge_count": len(p.edges),
                "version": p.version,
                "updated_at": p.updated_at,
            }
            for p in pipelines_db.values()
        ],
        "total": len(pipelines_db),
    }


@app.get("/pipelines/{pipeline_id}")
def get_pipeline(pipeline_id: str):
    if pipeline_id not in pipelines_db:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    return pipelines_db[pipeline_id].dict()


@app.put("/pipelines/{pipeline_id}")
def update_pipeline(pipeline_id: str, payload: PipelineSavePayload):
    if pipeline_id not in pipelines_db:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    existing = pipelines_db[pipeline_id]
    now = datetime.utcnow().isoformat()
    updated = PipelineRecord(
        id=pipeline_id,
        name=payload.name,
        nodes=payload.nodes,
        edges=payload.edges,
        nodeIDs=payload.nodeIDs,
        created_at=existing.created_at,
        updated_at=now,
        version=existing.version + 1,
    )
    pipelines_db[pipeline_id] = updated
    return updated.dict()


@app.delete("/pipelines/{pipeline_id}")
def delete_pipeline(pipeline_id: str):
    if pipeline_id not in pipelines_db:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    del pipelines_db[pipeline_id]
    return {"message": f"Pipeline {pipeline_id} deleted"}
