# News reader text index

Create news reader text index using Elasticsearch with Voikko plugin (support for Finnish language).

## Requirements

- Docker 17.12
- Node.js 8.9.4

- Increase your system mmap count setting by running:

```bash
sysctl -w vm.max_map_count=262144
```

See https://www.elastic.co/guide/en/elasticsearch/reference/current/vm-max-map-count.html for more information.

## Build

```bash
docker build -t news-reader-index  ./
```

## Run

```bash
docker run --rm -p 127.0.0.1:9200:9200 -p 127.0.0.1:9300:9300 -it news-reader-index:latest
```
## Load data to index

Populate elasticsearch index with news data:

```bash
npm install
node populate-index.js <PATH_TO_DATA_DIR>
```
