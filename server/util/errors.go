package util

import (
	"fmt"
	"log"
	"runtime"

	"github.com/gin-gonic/gin"
)

func PrintCaller(pc uintptr, filename string, line int, ok bool) string {
	return fmt.Sprintf("[error] in %s[%s:%d]", runtime.FuncForPC(pc).Name(), filename, line)
}

func ForwardError(msg string, args ...interface{}) error {
	caller := PrintCaller(runtime.Caller(1))
	fullmsg := fmt.Sprintf(msg, args...)
	return fmt.Errorf("%s %s", caller, fullmsg)
}

func HandleError(c *gin.Context, statusCode int, err error) {
	caller := PrintCaller(runtime.Caller(1))
	fullmsg := fmt.Errorf("%s %s", caller, err)
	log.Printf("%s [%d] %s", c.Request.URL.String(), statusCode, fullmsg)
	c.AbortWithError(statusCode, fullmsg)
}

/*
func HandleErrorMsg(c *gin.Context, statusCode int, msg string, args ...{}interface) {
	caller := PrintCaller(runtime.Caller(1))
	fullmsg := fmt.Printf(msg, *args)
	c.A
}
*/
