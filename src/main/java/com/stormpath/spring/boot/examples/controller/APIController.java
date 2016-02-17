/*
 * Copyright 2016 Stormpath, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.stormpath.spring.boot.examples.controller;

import com.stormpath.sdk.account.Account;
import com.stormpath.sdk.client.Client;
import com.stormpath.sdk.servlet.account.AccountResolver;
import com.stormpath.spring.boot.examples.model.AccountInfo;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.io.UnsupportedEncodingException;

@RestController
public class APIController {

    @Autowired
    Client client;

    // naturally restricted to authenticated users
    @RequestMapping("/restricted")
    public AccountInfo restricted(HttpServletRequest req) {
        Account account = AccountResolver.INSTANCE.getAccount(req);
        return new AccountInfo(account.getFullName(), account.getEmail());
    }

    // explicitly open to anyone by SpringSecurityWebAppConfig
    @RequestMapping("/decode")
    public Jws<Claims> decode(@RequestParam String token) throws UnsupportedEncodingException {

        Jws<Claims> claims = Jwts.parser()
            .setSigningKey(client.getApiKey().getSecret().getBytes("UTF-8"))
            .parseClaimsJws(token);

        return claims;
    }
}
