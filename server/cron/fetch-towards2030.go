package cron

import (
	"bytes"
	"context"
	"io"
	"log"
	"net/http"
	"strings"

	"fmt"
	"time"

	"com.codeka/scheduler/server/store"
	"golang.org/x/net/html"
)

func cronFetchTowards2030(ctx context.Context) error {
	// Fetch the URL
	url := "https://cms.sgi-usa.org/tmf/"
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		log.Printf("error creating request: %v", err)
		return err
	}

	// Set a user agent to avoid being blocked
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("error fetching %s: %v", url, err)
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("unexpected status code: %d", resp.StatusCode)
		return nil
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("error reading response body: %v", err)
		return err
	}

	doc, err := html.Parse(strings.NewReader(string(body)))
	if err != nil {
		log.Printf("error parsing HTML: %v", err)
		return err
	}

	motd := store.DashboardMotd{}
	parseMotd(doc, &motd)

	return store.SaveDashboardMotd(&motd)
}

// extractElements recursively walks through the HTML document and extracts interesting elements
func parseMotd(n *html.Node, motd *store.DashboardMotd) {
	if n.Type == html.ElementNode {
		// Paragraphs contain the main content.
		if n.Data == "p" {
			motd.MessageHTML += extractHTML(n) + "\n"
		}

		// Extract div with class "post-date"
		if n.Data == "div" && hasClass(n, "post-date") {
			dateStr := strings.TrimSpace(extractText(n))
			if dateStr != "" {
				t, err := parseDate(dateStr)
				if err != nil {
					log.Printf("parseMotd: failed to parse post-date: %v", err)
				} else {
					motd.PostDate = t
				}
			}
		}
	}

	// Recursively process child nodes
	for c := n.FirstChild; c != nil; c = c.NextSibling {
		parseMotd(c, motd)
	}
}

// extractHTML returns the HTML (including tags) for a node and its children. If an error occurs,
// it returns an empty string.
func extractHTML(n *html.Node) string {
	n.Attr = nil

	var buf bytes.Buffer
	err := html.Render(&buf, n)
	if err != nil {
		return ""
	}
	return buf.String()
}

// extractText retrieves the text content from an HTML node and its children, without any HTML tags.
func extractText(n *html.Node) string {
	var buf bytes.Buffer
	var f func(*html.Node)
	f = func(node *html.Node) {
		if node.Type == html.TextNode {
			buf.WriteString(node.Data)
		}
		for c := node.FirstChild; c != nil; c = c.NextSibling {
			f(c)
		}
	}
	f(n)
	return buf.String()
}

// getAttribute retrieves the value of an attribute from an HTML node
func getAttribute(n *html.Node, key string) string {
	for _, attr := range n.Attr {
		if attr.Key == key {
			return attr.Val
		}
	}
	return ""
}

// hasClass checks if an HTML node has a specific class
func hasClass(n *html.Node, className string) bool {
	class := getAttribute(n, "class")
	if class == "" {
		return false
	}
	// Split the class string and check if it contains the target class
	for _, c := range strings.Fields(class) {
		if c == className {
			return true
		}
	}
	return false
}

// parseDate parses date strings like "November 16, 2025" into time.Time
func parseDate(dateStr string) (time.Time, error) {
	// Layout for dates like: January 2, 2006
	layout := "January 2, 2006"
	t, err := time.Parse(layout, dateStr)
	if err != nil {
		return time.Time{}, fmt.Errorf("parseDate: could not parse %q: %w", dateStr, err)
	}
	return t, nil
}
