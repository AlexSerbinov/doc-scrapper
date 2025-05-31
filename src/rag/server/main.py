import subprocess
import sys
import json
import os
import time
import traceback
from pathlib import Path
from typing import Dict, List, Optional, Any
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, BackgroundTasks, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from ..core.rag_pipeline import RAGPipeline
from ..config.settings import get_settings
from ..vectorstore.chroma_vectorstore import ChromaVectorStore

# ... existing code ...

class ConsolidateRequest(BaseModel):
    collection_name: str
    project_name: Optional[str] = None

class ConsolidateResponse(BaseModel):
    success: bool
    markdown: str
    stats: Dict[str, Any]
    message: str

# ... existing endpoints ...

@app.post("/consolidate", response_model=ConsolidateResponse)
async def consolidate_documentation(request: ConsolidateRequest):
    """
    Generate consolidated markdown file for scraped documentation
    """
    try:
        collection_name = request.collection_name
        project_name = request.project_name or collection_name
        
        # Find the scraped docs directory
        scraped_docs_dir = Path("scraped-docs") / collection_name
        
        if not scraped_docs_dir.exists():
            raise HTTPException(
                status_code=404, 
                detail=f"Scraped documentation not found for collection: {collection_name}"
            )
        
        # Run TypeScript consolidation using Node.js
        try:
            # Build the TypeScript file first
            build_result = subprocess.run(
                ["npm", "run", "build"],
                cwd="./",
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if build_result.returncode != 0:
                print(f"Build warning: {build_result.stderr}")
            
            # Run the consolidation script
            result = subprocess.run([
                "node", 
                "-e", 
                f"""
                const {{ DocConsolidator }} = require('./dist/utils/contentStructExporter.js');
                const consolidator = new DocConsolidator({{
                    deleteComments: false,
                    outputDirectory: './consolidation-output'
                }});
                consolidator.consolidate('{scraped_docs_dir}', '{project_name}')
                    .then(result => {{
                        console.log(JSON.stringify(result));
                    }})
                    .catch(error => {{
                        console.error('Error:', error.message);
                        process.exit(1);
                    }});
                """
            ], 
            capture_output=True, 
            text=True,
            timeout=120
            )
            
            if result.returncode != 0:
                raise Exception(f"Consolidation failed: {result.stderr}")
            
            # Parse the output
            output_data = json.loads(result.stdout.strip())
            
            return ConsolidateResponse(
                success=True,
                markdown=output_data["markdown"],
                stats=output_data["stats"],
                message=f"Successfully consolidated {output_data['stats']['totalFiles']} files"
            )
            
        except subprocess.TimeoutExpired:
            raise HTTPException(status_code=408, detail="Consolidation timeout")
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Failed to parse consolidation output")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Consolidation error: {str(e)}")
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Consolidation error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}") 