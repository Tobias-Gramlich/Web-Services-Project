from fastapi import FastAPI
from api import getrequests
app = FastAPI()

# Register routers
app.include_router(getrequests.router)
