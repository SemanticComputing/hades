# Hades

News data entity search

## Requirements

- Docker 17.12

- Increase your system mmap count setting by running:

```bash
sudo sysctl -w vm.max_map_count=262144
```

See https://www.elastic.co/guide/en/elasticsearch/reference/current/vm-max-map-count.html for more information.

## Preparing

The ElasticSearch index and Fuseki database need to be set up before the system is operational.

### Initialize the index

Create news reader text index using Elasticsearch with Voikko plugin (support for Finnish language).

You will need to have the news data in `./yledata`.

Start the ElasticSearch instance:

```bash
docker-compose up -d elastic
```

Once the instance is running, run the indexing script (this will take a long while, and you need lots of RAM, if you're indexing the whole dataset):

```bash
docker-compose run --rm tasks populate-index.js
```

### Generate RDF

Create a directory for the rdf files:

```bash
mkdir data
chmod 777 data
```

Create RDF for the subjects in the news, and load them into the database:

```bash
docker-compose run --rm tasks parse-entities.js
docker-compose run --rm fuseki ./load_subjects.sh
```

Enrich the subjects:

```bash
docker-compose up -d fuseki
docker-compose run --rm tasks enrich-entities.js
docker-compose stop fuseki
docker-compose run --rm fuseki ./load_enrichments.sh
```

## Run

```bash
docker-compose up -d fuseki elastic api client
```
