create Card

``` 
dfx canister call backend createCard '( record {
    name = "Ariel";
    email = "arielrobotti@gmail.com";
    photo = blob "00/11/22/33/44/55/66/77/88/99";
    photoPreview = blob "00/11/22/33/44";
    phone = 54223687945;
    profession = "Motoko Dev";
    skils = vec {"Backend"; "Motoko"; "software architecture"};
    positions = vec {};
})'
```

create Company

``` 
dfx canister call backend createCompany '( record {
    phone = 542235478987;
    foundedYear = 1998;
    logo = blob "00/11/22/33/44/55/66/77/88/99";
    photoCeo = blob "00/11/22/33/44/55/66/77/88/99";
    thumbnailLogo = blob "00/11/22/33/44";
    thumbnailPhotoCeo = blob "00/11/22/33/44";
    name = "Alfajores Habana";
    location = "Mar Del Plata";
    website = opt "www.habana.com";
    email = "habanna@gmail.com";
    industry = "Pasteleria";
    ceo = "Juan Carlos Habanna";
    description = "Alfajores tradicionales";
    socialNetworks = vec {"habana.linkedin.com"; "habanna.x.com"};
})' 
```

create card for
```
dfx canister call backend createCardFor '( record {
    name = "Empleado1";
    email = "empleado1@gmail.com";
    photo = blob "00/11/22/33/44/55/66/77/88/99";
    photoPreview = blob "00/11/22/33/44";
    phone = 5422662313;
    profession = "Panadero";
    skils = vec {"Panificados"; "Manipulacion de alimentos"};
    positions = vec {record {company = 1; possition = "Supervisor"}};
    }, principal "ymgon-r53wh-becic-fsvsr-uajvf-5cpzw-pfk5m-phy5p-n5vhe-ihoz6-gqe"
)'
```

mushroom:   ymgon-r53wh-becic-fsvsr-uajvf-5cpzw-pfk5m-phy5p-n5vhe-ihoz6-gqe
flic:       qcirp-tviue-bxtvo-bniam-zfaku-5yy25-h2dwp-cex5m-ojvxu-5b4zd-fae