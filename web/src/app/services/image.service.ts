import { Injectable } from "@angular/core";
import { ENV } from "../env/environment";

// ImageService lets us show images from the backend. Mostly.
@Injectable()
export class ImageService {
  imageUrl(name?: string): string {
    if (!name) {
      return ""
    }

    return ENV.backend + "/_/img/" + name + ".png"
  }
}
