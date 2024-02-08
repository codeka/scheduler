package store

import (
	"database/sql"
	"log"
	"path"

	_ "modernc.org/sqlite"
)

var (
	db      *sql.DB
	datadir string
)

func Init(datdir string) error {
	datadir = datdir
	dbfile := path.Join(datadir, "store.db")
	dsn := "file:///" + dbfile + "?_pragma=foreign_keys(1)&_time_format=sqlite"
	log.Printf("dsn=%s", dsn)
	if newdb, err := sql.Open("sqlite", dsn); err != nil {
		return err
	} else {
		db = newdb
	}

	// Check what version of the datastore we have, and upgrade it if nessecary.
	version := GetCurrentSchemaVersion()
	log.Printf("Got schema version %d", version)
	if err := UpgradeSchema(version); err != nil {
		return err
	}

	return nil
}
