package notify

import (
	"context"
	"fmt"
	"os"

	brevo "github.com/getbrevo/brevo-go/lib"
)

var brevoClient *brevo.APIClient

func Setup() error {
	cfg := brevo.NewConfiguration()
	cfg.AddDefaultHeader("api-key", os.Getenv("BREVO_API_KEY"))
	// TODO: cfg.AddDefaultHeader("partner-key","YOUR_API_KEY")

	brevoClient = brevo.NewAPIClient(cfg)
	account, _, err := brevoClient.AccountApi.GetAccount(context.Background())
	if err != nil {
		return fmt.Errorf("error getting Brevo account: %v", err)
	}
	fmt.Println("Brevo:", account.CompanyName, "Plan:", account.Plan)

	err = EnsureNotificationTypes()
	if err != nil {
		return err
	}
	err = EnsureNotificationSettings()
	if err != nil {
		return err
	}

	return nil
}
