import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpInterceptorFn } from '@angular/common/http';

import { Observable } from 'rxjs';

/** Adds our secret key to all outbound requests. */
export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const secretKey = localStorage.getItem("secretKey");
  if (secretKey) {
    req = req.clone({
      headers: req.headers.set("Authorization", `Bearer ${secretKey}`)
    });
  }

  return next(req);
};
