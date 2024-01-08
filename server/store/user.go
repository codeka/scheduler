package store

import (
	"database/sql"
	"fmt"
)

func makeUser(row *sql.Rows) (*User, error) {
	user := &User{}
	if err := row.Scan(&user.ID, &user.Name, &user.Mail, &user.Phone); err != nil {
		return nil, err
	}

	return user, nil
}

// GetUserByEmail returns the User with the given email address. If the user doesn't exit, returns a nil User and nil
// error. Any other kind of error returns a non-nil error.
func GetUserByEmail(email string) (*User, error) {
	rows, err := db.Query("SELECT id, name, email, phone FROM users WHERE email=?", email)
	if err != nil {
		return nil, fmt.Errorf("error querying user by email: %v", err)
	}
	defer rows.Close()

	if rows.Next() {
		return makeUser(rows)
	} else {
		return nil, nil
	}
}

// GetUserByPhone returns the User with the given phone number. If the user doesn't exit, returns a nil User and nil
// error. Any other kind of error returns a non-nil error.
func GetUserByPhone(phone string) (*User, error) {
	rows, err := db.Query("SELECT id, name, email, phone FROM users WHERE phone=?", phone)
	if err != nil {
		return nil, fmt.Errorf("error querying user by phone: %v", err)
	}
	defer rows.Close()

	if rows.Next() {
		return makeUser(rows)
	} else {
		return nil, nil
	}
}

// CreateUserLogin creates a new user login with the given confirmation code for the given user.
func CreateUserLogin(user *User, code string) error {
	_, err := db.Exec(
		"INSERT INTO user_logins (user_id, confirmation_code, last_seen) VALUES (?, ?, JULIANDAY())",
		user.ID, code)
	return err
}
