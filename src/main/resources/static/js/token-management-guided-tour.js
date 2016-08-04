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
var accessToken, refreshToken;

var showOnlyDiv = function (divToShow) {

    var divs = [
        'login-form-div', 'access-token-div', 'access-token-decoded-div',
        'account-info-div', 'revoke-div', 'invalid-access-token-div', 'refresh-div'
    ];

    $.each(divs, function (index, div) {
        if (divToShow === div) {
            $('#' + div).show();
        } else {
            $('#' + div).hide();
        }
    });
};

$(function () {

    showOnlyDiv('login-form-div');

    // Step 1 - get an access token and refresh token using oauth2 grant_type=password
    $('#login-form').submit(function (e) {

        var theForm = $('#login-form');

        $.ajax({
            type: theForm.attr('method'),
            url: '/oauth/token',
            data: theForm.serialize(),
            success: function (data) {
                accessToken = data.access_token;
                refreshToken = data.refresh_token;
                var accessTokenParts = accessToken.split('.');
                $.each(['header', 'payload', 'signature'], function (index, value) {
                    $('#access-token-' + value).html(accessTokenParts[index]);
                });
                $('#login-error').hide();
                showOnlyDiv('access-token-div');
            },
            error: function () {
                $('#login-error').show();
            },
            complete: function() {
                $('#passwordInput').val('');
            }
        });

        e.preventDefault();
    });

    // Step 2 - Decode JWT Access Token
    $('#decode').click(function () {

        $.ajax({
            type: 'get',
            url: '/decode?token=' + accessToken,
            success: function (data) {
                var decodedAccessToken = [data.header, data.body];
                $.each(['header', 'payload'], function (index, value) {
                    $('#access-token-decoded-' + value)
                            .html('<pre>' + JSON.stringify(decodedAccessToken[index], null, 4) + '</pre>')
                });
                showOnlyDiv('access-token-decoded-div');
            }
        });
    });

    // Step 3 - Hit a protected endpoint using the access token
    $('#restricted').click(function () {

        $('#account-info-table tbody').empty();
        $.ajax({
            type: 'get',
            url: '/restricted',
            success: function (data) {
                var newRowContent = '<tr><td>' + data.fullName + '</td><td>' + data.email + '</td></tr>';
                $('#account-info-table tbody').append(newRowContent);
                showOnlyDiv('account-info-div');
            }
        })
    });

    // Step 4 - Refresh the access token
    $('#refresh').click(function () {

        $.ajax({
            type: 'post',
            url: '/oauth/token',
            data: 'grant_type=refresh_token&refresh_token=' + refreshToken,
            success: function (data) {
                var accessTokenParts = accessToken.split('.');
                $.each(['header', 'payload', 'signature'], function (index, value) {
                    $('#old-access-token-' + value).html(accessTokenParts[index]);
                });

                accessToken = data.access_token;

                accessTokenParts = accessToken.split('.');
                $.each(['header', 'payload', 'signature'], function (index, value) {
                    $('#new-access-token-' + value).html(accessTokenParts[index]);
                });

                showOnlyDiv('refresh-div');
            }
        })
    });

    // Step 5 - revoke access token
    $('#revoke').click(function () {

        $.ajax({
            type: 'post',
            url: '/logout',
            success: function () {
                showOnlyDiv('revoke-div');
            }
        })
    });

    // Step 6 - try to hit the restricted endpoint again with (now invalid) access token
    $('#restricted-invalid').click(function () {

        $.ajax({
            type: 'get',
            url: '/restricted',
            success: function (data) {
                // shouldn't get here
            },
            error: function (xhr) {
                $('#invalid-access-token-result')
                        .html('<pre>' + JSON.stringify(xhr.responseJSON, null, 4) + '</pre>');
                showOnlyDiv('invalid-access-token-div');
            }
        })
    });

    // Step 7 - start over
    $('#start-over').click(function () {

        showOnlyDiv('login-form-div');
    })
})
