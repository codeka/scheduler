package store

import (
	"database/sql"
	"fmt"

	"com.codeka/scheduler/server/util"
)

func makeUser(row *sql.Rows) (*User, error) {
	user := &User{}
	if err := row.Scan(&user.ID, &user.Name, &user.Email, &user.Phone); err != nil {
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

func GetUsers() ([]*User, error) {
	rows, err := db.Query(`
			SELECT id, name, email, phone
			FROM users`)
	if err != nil {
		return []*User{}, err
	}
	defer rows.Close()

	var users []*User
	for rows.Next() {
		user, err := makeUser(rows)
		if err != nil {
			continue
		}
		users = append(users, user)
	}
	return users, nil
}

func GetUser(id int64) (*User, error) {
	rows, err := db.Query(`
	    SELECT id, name, email, phone
			FROM users
			WHERE id = ?`, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if rows.Next() {
		return makeUser(rows)
	}
	return nil, nil
}

// GetUserRoles returns the roles the given user belongs to.
func GetUserRoles(id int64) ([]string, error) {
	rows, err := db.Query("SELECT role_name FROM user_roles WHERE user_id = ?", id)
	if err != nil {
		return []string{}, err
	}
	defer rows.Close()

	var roles []string
	for rows.Next() {
		var role string
		if err := rows.Scan(&role); err != nil {
			continue
		}
		roles = append(roles, role)
	}
	return roles, nil
}

// GetAllUserRoles returns a mapping of user ID to the list of roles that user belongs to. It does this for all users
// in the entire data store.
func GetAllUserRoles() (map[int64][]string, error) {
	roleMap := make(map[int64][]string)

	rows, err := db.Query("SELECT user_id, role_name FROM user_roles")
	if err != nil {
		return roleMap, err
	}
	defer rows.Close()

	for rows.Next() {
		var userID int64
		var role string
		if err := rows.Scan(&userID, &role); err != nil {
			continue
		}

		roles, ok := roleMap[userID]
		if !ok {
			roles = []string{}
		}
		roles = append(roles, role)
		roleMap[userID] = roles
	}
	return roleMap, nil
}

func GetUserGroups(id int64) ([]int64, error) {
	rows, err := db.Query("SELECT group_id FROM user_groups WHERE user_id = ?", id)
	if err != nil {
		return []int64{}, err
	}
	defer rows.Close()

	var groups []int64
	for rows.Next() {
		var groupID int64
		if err := rows.Scan(&groupID); err != nil {
			continue
		}
		groups = append(groups, groupID)
	}
	return groups, nil
}

func GetAllUserGroups() (map[int64][]int64, error) {
	groupMap := make(map[int64][]int64)

	rows, err := db.Query("SELECT user_id, group_id FROM user_groups")
	if err != nil {
		return groupMap, err
	}
	defer rows.Close()

	for rows.Next() {
		var userID int64
		var groupID int64
		if err := rows.Scan(&userID, &groupID); err != nil {
			continue
		}

		groups, ok := groupMap[userID]
		if !ok {
			groups = []int64{}
		}
		groups = append(groups, groupID)
		groupMap[userID] = groups
	}
	return groupMap, nil
}

// SaveUser saves the given user to the data store. If the user does not have an ID (ID is 0), then a new user is
// inserted and the user is updated with the correct ID.
func SaveUser(user *User) error {
	if user.ID == 0 {
		res, err := db.Exec(`
			INSERT INTO users
			  (name, email, phone)
			VALUES
			  (?, ?, ?)`,
			user.Name, user.Email, user.Phone)
		if err != nil {
			return util.ForwardError("insert into users: %v", err)
		}
		id, err := res.LastInsertId()
		if err != nil {
			return err
		}
		user.ID = id
	} else {
		_, err := db.Exec(`
		  UPDATE users SET
			  name = ?,
				email = ?,
				phone = ?
			WHERE id = ?`, user.Name, user.Email, user.Phone, user.ID)
		if err != nil {
			return util.ForwardError("update users: %v", err)
		}
	}

	return nil
}

func UpdateUserRoles(userID int64, roles []string) error {
	// TODO: This should be in a transaction so we don't just delete all roles and leave the DB inconsistent.
	_, err := db.Exec(`DELETE FROM user_roles WHERE user_id = ?`, userID)
	if err != nil {
		return err
	}

	stmt, err := db.Prepare(`INSERT INTO user_roles (user_id, role_name) VALUES (?, ?)`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	for _, role := range roles {
		_, err := stmt.Exec(userID, role)
		if err != nil {
			return err
		}
	}

	return nil
}

func UpdateUserGroups(userID int64, groups []int64) error {
	// TODO: This should be in a transaction so we don't just delete all roles and leave the DB inconsistent.
	_, err := db.Exec(`DELETE FROM user_groups WHERE user_id = ?`, userID)
	if err != nil {
		return err
	}

	stmt, err := db.Prepare(`INSERT INTO user_groups (user_id, group_id) VALUES (?, ?)`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	for _, groupID := range groups {
		_, err := stmt.Exec(userID, groupID)
		if err != nil {
			return err
		}
	}

	return nil
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
