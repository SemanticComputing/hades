FROM secoresearch/fuseki

COPY --chown=9008:9008 * $FUSEKI_HOME/

RUN chmod +x $FUSEKI_HOME/load_subjects.sh $FUSEKI_HOME/load_enrichments.sh $FUSEKI_HOME/tdbloader

ENV ASSEMBLER $FUSEKI_BASE/configuration/assembler.ttl

EXPOSE 3030

USER 9008

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["java", "-cp", "*:/javalibs/*", "org.apache.jena.fuseki.cmd.FusekiCmd"]
