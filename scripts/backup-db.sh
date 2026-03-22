#!/bin/bash
BACKUP_DIR=/var/backups/glitched
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
pg_dump glitched | gzip > $BACKUP_DIR/glitched_$TIMESTAMP.sql.gz
ls -t $BACKUP_DIR/*.sql.gz | tail -n +31 | xargs -r rm
echo "Backup saved"
