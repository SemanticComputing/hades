FROM secoresearch/fuseki

ENV TMPDIR /tmp/data
COPY --chown=9008:9008 * $TMPDIR

# Load entities.nt and enrichments.ttl
RUN mkdir -p $FUSEKI_BASE/databases/tdb $FUSEKI_BASE/databases/lucene
ENV ASSEMBLER $FUSEKI_BASE/configuration/assembler.ttl
ENV JAVA_CMD java -cp "$FUSEKI_HOME/fuseki-server.jar:/javalibs/*"
ENV TDBLOADER $JAVA_CMD tdb.tdbloader --desc=$ASSEMBLER

RUN $TDBLOADER --graph=http://ldf.fi/newsreader/entities/ $TMPDIR/entities.nt  \
    && $TDBLOADER --graph=http://ldf.fi/newsreader/enrichments/ $TMPDIR/enrichments.ttl  \
    && $JAVA_CMD jena.textindexer --desc=$ASSEMBLER \
    && rm -rf $TMPDIR

EXPOSE 3030

USER 9008

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["java", "-cp", "*:/javalibs/*", "org.apache.jena.fuseki.cmd.FusekiCmd"]
