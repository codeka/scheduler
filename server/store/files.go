package store

import (
	"path"

	"com.codeka/scheduler/server/util"
)

var (
	nameLetters = []rune("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")
	nameSize    = 16
)

// MakeImageFileName makes a unique name for an image. Returns the name of the image you can give to a client to
// refer to this file and the path of the file itself.
func MakeImageFileName() (name, p string, err error) {
	name, err = util.RandomSequence(nameSize, nameLetters)
	if err != nil {
		return
	}

	p = path.Join(datadir, "img", name+".png")
	return
}

func ImageFileName(name string) string {
	return path.Join(datadir, "img", name+".png")
}
