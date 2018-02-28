#!/bin/bash

sudo sysctl -w vm.max_map_count=262144
docker run -v $(pwd)/esdata:/usr/share/elasticsearch/data --rm -p 127.0.0.1:9200:9200 -p 127.0.0.1:9300:9300 -it news-reader-index:latest
