events
{
    worker_connections
1024;
}

http
{
    include / etc / nginx / mime.types;
default_type
application / octet - stream;

sendfile
on;
keepalive_timeout
65;

server
{
    listen
80;
server_name
localhost;

location / {
    root / usr / share / nginx / html;
index
index.html
index.htm;
try_files $uri $uri / / index.html;
}

# API proxy to backend services
location / api / auth / {
    proxy_pass
http: // auth - service: 8080 /;
proxy_set_header
Host $host;
proxy_set_header
X - Real - IP $remote_addr;
proxy_set_header
X - Forwarded - For $proxy_add_x_forwarded_for;
proxy_set_header
X - Forwarded - Proto $scheme;
}

location / api / products / {
    proxy_pass
http: // products - service: 8080 /;
proxy_set_header
Host $host;
proxy_set_header
X - Real - IP $remote_addr;
proxy_set_header
X - Forwarded - For $proxy_add_x_forwarded_for;
proxy_set_header
X - Forwarded - Proto $scheme;
}

location / api / user / {
    proxy_pass
http: // user - related - service: 8080 /;
proxy_set_header
Host $host;
proxy_set_header
X - Real - IP $remote_addr;
proxy_set_header
X - Forwarded - For $proxy_add_x_forwarded_for;
proxy_set_header
X - Forwarded - Proto $scheme;
}

location / api / cart / {
    proxy_pass
http: // cart - service: 8080 /;
proxy_set_header
Host $host;
proxy_set_header
X - Real - IP $remote_addr;
proxy_set_header
X - Forwarded - For $proxy_add_x_forwarded_for;
proxy_set_header
X - Forwarded - Proto $scheme;
}

error_page
500
502
503
504 / 50
x.html;
location = / 50
x.html
{
    root / usr / share / nginx / html;
}
}
}