FROM openjdk:8-jre

RUN apt-get update
RUN apt-get install -y wget
RUN wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-5.1.1.deb
RUN dpkg -i elasticsearch-5.1.1.deb

# Install libvoikko
RUN apt-get install -y libvoikko1

# Add dictionary
RUN mkdir -p /usr/lib/voikko
WORKDIR /usr/lib/voikko
RUN wget http://www.puimula.org/htp/testing/voikko-snapshot-v5/dict-morpho.zip
RUN unzip dict-morpho.zip

# Install elasticsearch plugin
RUN /usr/share/elasticsearch/bin/elasticsearch-plugin install https://github.com/EvidentSolutions/elasticsearch-analysis-voikko/releases/download/v0.5.0/elasticsearch-analysis-voikko-0.5.0.zip
COPY --chown=elasticsearch:elasticsearch .java.policy /home/elasticsearch/

RUN mkdir -p /usr/share/elasticsearch/logs /usr/share/elasticsearch/config/scripts /usr/share/elasticsearch/data
COPY elasticsearch.yml /usr/share/elasticsearch/config/
RUN cp /etc/elasticsearch/log4j2.properties /usr/share/elasticsearch/config
RUN chown -R elasticsearch:elasticsearch /usr/share/elasticsearch

EXPOSE 9200 9300

WORKDIR /home/elasticsearch
USER elasticsearch

CMD /usr/share/elasticsearch/bin/elasticsearch -Enetwork.host=0.0.0.0
