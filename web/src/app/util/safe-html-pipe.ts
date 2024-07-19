import { Pipe } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

@Pipe({
  name: "safeHtml",
  standalone: true,
})
export class SafeHtmlPipe {
  constructor(private sanitizer: DomSanitizer) {}

  transform(html?: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html ?? "");
  }
}
