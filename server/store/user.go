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
	}
	return nil, nil
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
	}
	return nil, nil
}

// GetUserByConfirmationCode returns the User that matches the given confirmation code.
func GetUserByConfirmationCode(code string) (*User, error) {
	rows, err := db.Query(`
			SELECT id, name, email, phone
			FROM users INNER JOIN	user_logins
		    ON users.id = user_id
			WHERE confirmation_code = ?`,
		code)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if rows.Next() {
		return makeUser(rows)
	}
	return nil, nil
}

// GetUserBySecret returns the User that matches the given secret key.
func GetUserBySecret(secretKey string) (*User, error) {
	rows, err := db.Query(`
			SELECT id, name, email, phone
			FROM users INNER JOIN	user_logins
		    ON users.id = user_id
			WHERE secret_key = ?`,
		secretKey)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if rows.Next() {
		return makeUser(rows)
	}
	return nil, nil
}

// CreateUserLogin creates a new user login with the given confirmation code for the given user.
func CreateUserLogin(user *User, code string) error {
	_, err := db.Exec(
		"INSERT INTO user_logins (user_id, confirmation_code, last_seen) VALUES (?, ?, JULIANDAY())",
		user.ID, code)
	return err
}

func SaveSecret(id int64, confirmationCode string, secret string) error {
	res, err := db.Exec(`
	  UPDATE user_logins SET
		  secret_key = ?,
			confirmation_code = '',
			last_seen = JULIANDAY()
		WHERE user_id = ?
		  AND confirmation_code = ?`,
		secret, id, confirmationCode)
	if err != nil {
		return err
	}
	n, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if n <= 0 {
		return fmt.Errorf("no rows updated, wrong confirmation code?")
	}
	return nil
}
