# scarbble code hunting

[![Build Status](https://travis-ci.org/SoftToys/scarbble.svg?branch=master)](https://travis-ci.org/SoftToys/scarbble)

to run locally
* install dev server: `npm -g install light-server`
* then  `npm -g install light-server`
* and open http://localhost:4000

to prepare game:

generate links as :
run in browser:
letters params: 
`https://s3.amazonaws.com/assets-localdev/index.html?l=' + btoa(encodeURIComponent("ל"))` 

for riddle , example:
`btoa(encodeURIComponent("who killed roger rabbit"))`

for answer:
```
    async function digestMessage(message) {
        const encoder = new TextEncoder();
        const data = encoder.encode(message);
        const bytes = await window.crypto.subtle.digest('SHA-256', data);

        const hashed = btoa(
            new Uint8Array(bytes)
                .reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        return hashed;
    }

    (await digestMessage("the answer"));
```

