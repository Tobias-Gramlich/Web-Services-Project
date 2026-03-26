FROM ubuntu:latest
LABEL authors="melinaklein"

ENTRYPOINT ["top", "-b"]