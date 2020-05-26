




 !! express project initialization

vmax:vchat john$ express --ejs --view=ejs --git vchat

  warning: option `--ejs' has been renamed to `--view=ejs'


   create : vchat/
   create : vchat/public/
   create : vchat/public/javascripts/
   create : vchat/public/images/
   create : vchat/public/stylesheets/
   create : vchat/public/stylesheets/style.css
   create : vchat/routes/
   create : vchat/routes/index.js
   create : vchat/routes/users.js
   create : vchat/views/
   create : vchat/views/error.ejs
   create : vchat/views/index.ejs
   create : vchat/.gitignore
   create : vchat/app.js
   create : vchat/package.json
   create : vchat/bin/
   create : vchat/bin/www

   change directory:
     $ cd vchat

   install dependencies:
     $ npm install

   run the app:
     $ DEBUG=vchat:* npm start


!! ssl cert generation

openssl req -new -newkey rsa:2048 -nodes -keyout wildcard-johnfowler.key -out wildcard-johnfowler.csr


!! ssl cert installation

Namecheap sends zip containing cert and associated chain certs. These need to be concatentated into a single file (file order is important)

cat __johnfowler_dev.crt __johnfowler_dev.ca-bundle >> __johnfowler_dev_cert_chain.crt

Use the cert chain file and .key created when the .csr was generated and place them in the ssl certs folder for the web server (/etc/ssl for our usual nginx configuration)

Place reference in the nginx config for those servers using ssl.


!!  check ssl expiration

openssl x509 -enddate -noout -in certificate.crt
