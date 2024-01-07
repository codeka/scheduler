package api

type User struct {
	ID    int64  `json:"id"`
	Name  string `json:"name"`
	Mail  string `json:"mail"`
	Phone string `json:"phone"`
}
