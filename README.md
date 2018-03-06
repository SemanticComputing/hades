# News reader text index

Create news reader text index using Elasticsearch with Voikko plugin (support for Finnish language).

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

You will need to have the news data in `./yledata`.

Create a directory for the index:

```bash
mkdir esdata
chmod 777 esdata
```

Start the ElasticSearch instance:

```bash
docker-compose up -d elastic
```

Once the instance is running, run the indexing script (this will take a long while, and you need lots of RAM, if you're indexing the whole dataset):

```bash
docker-compose run tasks populate-index.js
```

### Generate RDF

Create a directory for the Fuseki databse, and for the rdf files:

```bash
mkdir fuseki-db data
chmod 777 fuseki-db data
```

Create RDF for the subjects in the news, and load them into the database:

```bash
docker-compose run tasks parse-entities.js
docker-compose run fuseki ./load_subjects.sh
```

Enrich the subjects:

```bash
docker-compose up -d fuseki
docker-compose run tasks enrich-entities.js
docker-compose down
docker-compose run fuseki ./load_enrichments.sh
```

## Run

```bash
docker-compose up fuseki elastic api
```
