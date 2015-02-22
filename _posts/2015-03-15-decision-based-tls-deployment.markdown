---
layout:     post
title:      "A Decision Driven Approach to Implementing TLS"
date:       2015-03-15 12:00:00
categories: security, tls
---

### Decision 1: Getting a certificate

A major goal of TLS is to provide endpoint authentication, which is to verify that communications are with who we intended. To this end, you need to generate a certificate issued by a certificate authority allowing the identity of your website to be validated during a TLS handshake.

In the process of obtaining a certificate, a number of important decisions need to be made.




First, you need to decide where to buy a certificate.

Second, you need to decide what type of certificate to buy, single domain, wildcard, or extra validation.




In the certificate generation process, you will need to create strong public/private key pair for use during the TLS handshake. The public key will then be used to generate a certificate signing request (CSR) that is sent to a Certificate Authority (CA) to generate the certificate. Let's break down these processes.

#### Generating a Public/Private Key Pair

Like many things with TLS, creating a key pair involves a few simple steps, but what is actually happening is quite complex. There are a few decisions you need to make at this point: 1) whether or not to encrypt your private key, and 2) the strength of the key pair.

**Decision `*`: Key algorithm**

When a client attempts to create a secure connection with a server, it authenticates that the communications are occurring with the intended server. The server presents its certificate that contains a public key. This public key, along with the server's private key, allow authenticity of the communication to be established. The cryptographical algorithm that provides this signature of authenticity is determined by the key algorithm that you choose to use when generating your public/private key pair. Using this algorithm and the public/private key, a digital signature for the certificate can be generated.

To create the digital signature, the server's private key is used by an algorithm to sign a hash of data from the certificate. This data hash is publicly available. The digital signature is sent from the server to the client. The client can use the server's public key to decrypt the digital signature (this is possible because it was encrypted with the private key). The client can compare the decrypted hash with the publicly available hash to verify the authenticity of the certificate.

The decision you make when generating your public/private key dictates how the hash is digitally signed. From a decision making perspective, you really only can choose RSA signing at this point. It is the most widely supported by clients and servers; however, [ECDSA](https://blog.cloudflare.com/ecdsa-the-digital-signature-algorithm-of-a-better-internet/) is steadily on the rise and will likely be a big part of the conversation in the coming years.

The primary difference between RSA and ECDSA is that ECDSA is based on [elliptic curve cryptography](http://blog.cloudflare.com/a-relatively-easy-to-understand-primer-on-elliptic-curve-cryptography), which provides significantly smaller key sizes with the same or even greater levels of security. From a security standpoint, ECDSA is likely a better choice, but its limited practical deployment use makes it difficult to advocate at this point.

**Decision `*`: Key strength**

When you generate your public/private key pair, you must decide the how strong of a key to deploy. The stronger the key, the better the security; the weaker the key, the worse the security. This would make you want to have a really strong key, right? The trade off with key strength is that the stronger/larger the key, the more time it takes to send the key and use it for encryption/decryption processes. Ideally, you are looking for a key that is adequately strong and adequately performant.

Key strength ultimately means key size. A bigger key corresponds to bigger numbers used for the asymmetric encryption. As such, key strength is measured in bits.

The size of the key used is dependent upon the key algorithm chosen. For RSA keys, [2048 bits](http://news.netcraft.com/archives/2012/09/10/minimum-rsa-public-key-lengths-guidelines-or-rules.html) is now considered the practical standard for key size. This recommendation is based on the assumption that 1024 bit keys will soon be [crackable](http://www.techworld.com/news/security/rsa-1024-bit-private-key-encryption-cracked-3214360/) while 2048 bit keys will not be crackable [until 2030](http://www.emc.com/emc-plus/rsa-labs/historical/twirl-and-rsa-key-size.htm) (and by crackable, I mean within a person's lifetime with significant computational resources). 4096 bit keys would give you additional security, but given that 2048 bits appear to be sufficient, 4096 bits might begin to be be too costly in terms of [performance]. 

Should you chose a ECDSA key exchange algorithm, you have chosen a path that allows for smaller keys, without security compromise. If you choose to deploy a public key based on ECC, you are able to deploy a 256-bit key, which is theoretically as strong as a [3072-bit RSA key](http://www.keylength.com/en/4/). This allows you to greatly reduce the size of the key, provide greater security levels, and improve TLS performance.

**Decision `*`: Encrypting your private key with a passphrase**

As you prepare to make a CSR, you generate a private key. This private key will ultimately be placed on your server and optionally stored in a secondary safe location in the event that your lose the private key. This means that you will likely be moving the key around, perhaps over many different protocols. To help ensure the safety of the key, you may choose to encrypt it. If a malicious attacker gets a hold of your key, she will be able to impersonate your site and potentially decrypt communications between your site and users.

That said, encrypting your private key comes with a maintenance cost; any time that your server software or any other application needs to access your private key, it will need to be decrypted. In other words, you will prompted for the key's encryption password. Imagine, if you will, every time you type `service nginx restart` being prompted for a password to decrypt your key. Also, imagine how hard it is to implement software like [Monit](http://mmonit.com/) to proactively monitor and restart your services if they need user input to decrypt a key.

While the benefits of encrypting your private key are obvious, the trade offs for maintenance cannot be easily dismissed. A middle ground approach is to *encrypt your key*, move it to your server, and *decrypt it on the server*. This ensures that when you are passing your key around boxes it is encrypted, but when it is in use on the server, it is decrypted and can be accessed without human intervention. Of course, this leaves your key vulnerable if an attacker gains access to your server and the key is not properly controlled.

**Using OpenSSL to Generate the Key Pair**

Now that we've thoroughly discussed the decisions that go into generating a public/private key pair for a TLS certificate, let me give you my current preferences. I prefer to use RSA for the key algorithm, a key size of 2048 bits, and a strong passphrase. If you agree with these decisions, you can use the following command to generate your public/private key pair:

{% highlight bash %}
openssl genrsa -aes256 -out private-encrypted.key 2048
{% endhighlight bash %}

Breaking it down, `genrsa` will generate an RSA key pair. `-aes256` is the encryption algorithm used for encrypting the private key with a passphrase. AES256 is really strong and it could be dialed down to 128 (e.g., `-aes128`). Since I'll only be decrypting this key outside of the TLS handshake, I am not concerned about any performance concerns with a bigger key size for encrypting the private key. The key is saved to a file with `-out private-encrypted.key`. The key size is dictated with the `2048` argument<span class="footnote-article-number">1</span>.

The result of this action is [PEM formatted](http://how2ssl.com/articles/working_with_pem_files/) private key. The key looks like:

{% highlight bash %}
-----BEGIN RSA PRIVATE KEY-----
Proc-Type: 4,ENCRYPTED
DEK-Info: AES-256-CBC,339FF84F01DA8472A9B16F0D7316AF13
 
DYQc5txfVANnxARBVDaZFOFdx5nEOnj5IhjYLIT75YL2i72yNxLYtuujL8SZVXAD
mAkKe59/1nJL5+v+Ag1t8sV3G0gy9JpQg5CfRW3uVVevF7ayczZ4xEsRZCippdfi
124bPPf0uc6qHwnyitwpVMSu7EBq76z4cna52NyEgk0miBs38Azrc9j1CmBhJQ9j
bRDQb60bdo8BbH6Q3vuc4/YHEN1Icd/qXpxe52/A8oG58qM0L1PTahbNtzjY5DB/
A1O//aNtYZ2P2862UU0IGQHOplAYgUq8MI3fdSrFSOQ2dM/JtGn3z/07ZDIZ6trh
B7vcl46s45nF3jhEGCRfLj8uUdD+gcm8rgRgQRKSlSOmNMyrzlv4y64rJZGYn8UM
l/jOsAgLO1haca8d1fBSJB/cCCoFpDwwHm94JpBd+KpO+Uo+k4h3hydRSkkT8wNp
6Ye0x854fp0iUKiuJ8ECLtsNNqxth1YGdiKs3me38qZEvl6gH3Z87d4mYI+6nweP
6At/6IzBt6r38Ux1v64W+UmlsyZBYKQHtaog2W8GMMgzDLAYx4lEvuV4Mw2hfEuY
FQGfJm8Sh84zwL6z2jyAbABKQFGVhTcIgjDUJN0QjarddP5QHXeUYS7+u93Yz9JA
oGV7SOaAtPB+mBFCiB0ArPMhnftMtmB+P06HtsK5RRWnYQqDMa4Ya0fBuQkQ5EQt
QyT4Ej1fMAqxL48T3VqsgY04KkNfQ7PwDbJSIhoDcWbqdqxP9YsONUziKS6p+J07
Fk17fZi6lzoYcZAPjwNYZ9XxXrKInJIY/Q8lEzTcjJ0Pg08sADmmBojCjKnGtMDl
mDwBz+f6DXrVNlhq+3ORv1InVGuhpIbxxsDhSQw9PEmT0tUqm+/Z3cdH+/YfKUV+
PccuyQM0PCdTh6TxNIp/YlUzxr2l+US48IrzbZ9hqDhsx0GUeqmB+4A+GmDYnUVN
bZxQzWN14hCJNSCehrxuJ4ubaz15uiUWNDTsWJzTzcinZh1XS0+Zajon3h/Dbnno
Upq7X9YfJxxm+vDqb4VxgsfN7p1B0ufk3DsmC2Rmeu/X9+rYTnn9Baqjst2rijSg
2uRvFQF5+PXV6J5CzBKitXUZYR6a8wtzlwUCWQPTESfyzhfF6KvoCyZnwovOsjxC
g4l8YNgRa3WxoIR+nI2BjwFS4xC+IefrRV3KdTVBiQXz+2qrrA8yM2M3Z4ZjQ/g2
uq7CHefWKGd3v7Go20jHKIODmzinyzqWydjPRk76dnDG4Yo4Nh3rcgHGna1pW9jz
xDPHfBppClNnhINgMsOBxqcok8UpC5VcHlZJ0vNa22lRsacR29DWstqevcYoJdfm
LojHF68sHNmVuiR70xHo0929NTK2qFOz1obN2QxE9gmIjszPC6T9KAztZfPvOjQK
iLNLAid4/WQb3sR/taiJeZE2ACoREecXFyx2hNJijQggaA60G4KWM/GkzyZAZnmZ
vUDnPEg1YJllUN1T44HL91RKzbxnGwTxO9JZhKgXZr4+NoyQs/8vk+7A8ongIIe6
/w+6aHMJilXsQZlRRVZq+iKLE+NXJay7MLzmDKQe5yFsYubDkT5D+g1znJrMgE1z
-----END RSA PRIVATE KEY-----
{% endhighlight bash %}

This is the encrypted version of the key. Unencrypted, the key looks like:

{% highlight bash %}
Private-Key: (2048 bit)
modulus:
    00:a3:ae:c9:6b:8f:89:2c:26:62:57:d5:14:d9:5e:
    43:41:e4:69:b8:e6:c5:0c:e7:35:a4:09:f3:af:8c:
    a2:c3:1d:a7:1c:bc:95:b2:36:c8:68:29:a5:fe:14:
    85:83:48:a4:b7:8b:30:ea:34:f3:f4:8c:0c:85:0a:
    64:d1:22:b5:26:04:bc:84:f6:00:04:23:55:43:e8:
    fc:0c:36:9c:6b:1b:54:24:11:42:d2:0a:16:15:d6:
    ce:50:8b:3d:ba:8f:9e:3c:b2:dd:7d:84:e4:b8:e9:
    a7:45:8a:23:d8:bd:d7:a4:70:05:4a:a2:c9:43:27:
    5c:2a:71:54:99:a2:96:58:6f:2b:46:87:2f:a7:02:
    3a:19:ff:0b:66:c8:29:9f:3f:4e:b8:4d:3a:7c:4f:
    13:ea:51:f2:10:4e:14:c0:ec:19:9a:9e:04:25:40:
    c2:6b:60:25:cd:cf:55:be:61:55:5a:03:26:33:e2:
    00:b9:c4:14:06:b3:59:bd:3b:73:37:17:30:b3:52:
    52:73:d9:14:ff:67:ca:c5:ce:8d:6d:70:09:26:62:
    14:e5:2d:25:57:f5:bf:f4:af:88:cf:ed:8e:a5:3f:
    ed:94:76:2d:b7:ed:ab:2e:de:6b:38:7e:75:af:63:
    0e:d7:a7:5d:f8:5b:e2:76:ac:33:ee:58:37:a8:a3:
    73:19
publicExponent: 65537 (0x10001)
privateExponent:
    00:8b:65:7e:8a:08:ca:94:7b:f8:02:bf:28:2b:5a:
    58:c3:14:08:69:7c:b6:d2:1f:52:12:6a:9b:4a:a4:
    e5:b4:6f:5b:73:60:b3:c7:fb:59:bf:43:c0:e6:da:
    89:3d:de:2e:d1:55:4c:0a:19:a0:ad:62:5c:03:2d:
    6f:e0:9f:c3:50:26:76:7a:71:9a:5f:eb:cb:60:b3:
    59:7b:f9:42:4b:01:12:2e:49:38:f3:f1:bd:0f:4a:
    49:98:54:8c:f4:85:fd:07:ca:78:50:be:4d:9f:a0:
    f5:60:86:9d:b2:a7:32:b0:0a:ea:a6:be:6d:d2:b0:
    01:90:ef:c5:51:b6:22:7e:1a:8a:11:9e:38:41:73:
    b0:a5:c9:1c:c3:b1:9e:13:d6:9c:b1:3d:d6:6d:3a:
    4a:6a:1f:dc:42:eb:31:79:97:e6:37:58:c0:b6:5c:
    f4:09:63:48:f7:b4:e3:e6:87:c5:be:98:e4:af:18:
    39:76:90:72:22:be:5d:c0:7f:c4:fa:56:71:08:4c:
    0f:f5:cb:46:29:f6:e3:4e:7c:79:2c:b4:62:6f:31:
    65:85:61:1d:8b:3e:94:14:1f:9c:5f:34:f7:25:58:
    c4:61:ff:02:54:08:cc:40:ab:0e:8c:e2:39:78:14:
    5e:d8:24:12:75:86:98:7c:5e:63:9b:31:34:a0:d4:
    54:01
prime1:
    00:d3:83:19:cf:be:23:95:11:29:fe:9a:94:90:ef:
    6b:1d:80:fc:5f:66:1f:cc:33:8c:22:97:b9:37:a0:
    5f:89:50:b3:4d:af:2c:cc:02:09:8d:5a:42:a0:a2:
    ac:88:35:84:45:78:0b:9e:fe:e5:6b:3e:7b:53:74:
    bb:5d:91:a2:bb:4d:43:b1:75:03:e9:d9:1e:be:9d:
    7e:e6:98:f5:f7:5b:ea:02:b5:c5:b4:a1:e1:43:7f:
    98:6f:91:9f:fb:85:78:49:5a:e9:49:4d:e3:15:1b:
    b5:10:c5:6b:e3:81:2e:21:89:77:0a:db:28:b2:d5:
    dd:be:5e:20:e3:26:18:d9:99
prime2:
    00:c6:1c:4e:d0:51:8a:1b:1d:0d:3c:2f:28:a8:78:
    e9:c7:95:81:be:2b:e8:a7:b2:e8:ce:37:1b:b3:fe:
    83:82:a0:d7:24:0d:43:62:10:be:6a:34:08:75:aa:
    c2:58:40:93:cb:f5:de:8d:82:eb:ca:e3:65:c8:c3:
    06:0e:7d:91:10:7d:d0:e8:91:52:b5:3c:ac:4a:26:
    73:2e:a2:2e:3c:77:c8:d8:4d:2d:a4:9f:54:46:f1:
    f8:6a:64:95:1b:a3:53:fe:18:0f:8c:7c:72:87:9c:
    57:2a:2b:71:3f:bd:d5:0c:f3:9d:5c:d3:77:bf:a8:
    1d:1e:10:5d:b6:7b:8e:55:81
exponent1:
    63:16:31:cb:5e:b9:f0:a5:9f:d4:c4:ba:00:c4:08:
    9c:43:c6:f7:32:32:87:49:46:c7:15:e9:11:24:32:
    5d:73:ce:eb:ff:ba:ae:bf:ed:95:a8:c9:39:d3:bb:
    9b:fb:e6:41:5d:21:a4:94:a9:09:7a:b5:ef:bc:e9:
    e1:c5:ce:44:8c:c7:bf:a4:9f:f6:b7:5e:6d:d1:fe:
    97:2c:e5:5d:c2:53:78:7d:8b:67:39:c6:fc:06:14:
    75:7f:f5:40:b1:a0:4e:4d:26:a8:ce:b2:29:3b:57:
    b1:c9:aa:e7:63:a7:26:d2:ed:4f:ca:a7:e0:4f:cc:
    97:d8:24:f4:04:ee:f3:51
exponent2:
    00:97:99:bb:fa:10:1b:b6:29:e2:21:e7:18:9e:eb:
    80:42:79:b7:42:36:c9:9f:e2:f9:e2:2c:2b:a7:ee:
    a0:e6:8a:7c:78:1b:2a:30:56:0d:d0:a9:a6:bb:9c:
    83:82:13:50:c6:68:8c:f9:0f:71:ae:dd:9a:db:29:
    da:6d:a6:4b:27:2a:90:7e:18:0f:09:9f:b7:5c:3a:
    d6:33:9e:69:f1:5d:dc:b5:21:42:47:52:a1:a4:74:
    b0:1b:82:82:d4:16:85:44:d1:56:bc:b3:d2:d4:d1:
    9f:a6:26:7e:50:3f:cd:54:4e:ec:61:c7:75:40:95:
    be:4a:6e:4d:b8:42:0e:a6:81
coefficient:
    57:48:d4:18:0e:e8:7e:48:b7:d3:40:d9:4a:23:ee:
    5d:51:4b:3d:32:b2:f4:14:8c:46:c9:04:4c:71:e8:
    c0:84:ae:8d:85:b6:26:ab:cc:9c:0c:37:c2:57:ef:
    2c:e4:1f:8e:3c:8f:63:22:7e:6f:ae:fd:aa:98:62:
    b3:7f:a2:18:62:da:8b:69:6d:1e:4c:b6:e2:69:3b:
    6e:9c:cb:c2:df:9b:14:72:05:f4:22:bd:a3:2e:72:
    83:74:60:5c:8f:a5:0a:a5:c6:eb:dc:95:1d:63:e8:
    44:ca:8f:a3:c2:fd:71:23:5d:3c:f5:5d:7f:26:f7:
    29:8a:1e:7d:5a:7d:88:90
writing RSA key
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAo67Ja4+JLCZiV9UU2V5DQeRpuObFDOc1pAnzr4yiwx2nHLyV
sjbIaCml/hSFg0ikt4sw6jTz9IwMhQpk0SK1JgS8hPYABCNVQ+j8DDacaxtUJBFC
0goWFdbOUIs9uo+ePLLdfYTkuOmnRYoj2L3XpHAFSqLJQydcKnFUmaKWWG8rRocv
pwI6Gf8LZsgpnz9OuE06fE8T6lHyEE4UwOwZmp4EJUDCa2Alzc9VvmFVWgMmM+IA
ucQUBrNZvTtzNxcws1JSc9kU/2fKxc6NbXAJJmIU5S0lV/W/9K+Iz+2OpT/tlHYt
t+2rLt5rOH51r2MO16dd+Fvidqwz7lg3qKNzGQIDAQABAoIBAQCLZX6KCMqUe/gC
vygrWljDFAhpfLbSH1ISaptKpOW0b1tzYLPH+1m/Q8Dm2ok93i7RVUwKGaCtYlwD
LW/gn8NQJnZ6cZpf68tgs1l7+UJLARIuSTjz8b0PSkmYVIz0hf0HynhQvk2foPVg
hp2ypzKwCuqmvm3SsAGQ78VRtiJ+GooRnjhBc7ClyRzDsZ4T1pyxPdZtOkpqH9xC
6zF5l+Y3WMC2XPQJY0j3tOPmh8W+mOSvGDl2kHIivl3Af8T6VnEITA/1y0Yp9uNO
fHkstGJvMWWFYR2LPpQUH5xfNPclWMRh/wJUCMxAqw6M4jl4FF7YJBJ1hph8XmOb
MTSg1FQBAoGBANODGc++I5URKf6alJDvax2A/F9mH8wzjCKXuTegX4lQs02vLMwC
CY1aQqCirIg1hEV4C57+5Ws+e1N0u12RortNQ7F1A+nZHr6dfuaY9fdb6gK1xbSh
4UN/mG+Rn/uFeEla6UlN4xUbtRDFa+OBLiGJdwrbKLLV3b5eIOMmGNmZAoGBAMYc
TtBRihsdDTwvKKh46ceVgb4r6Key6M43G7P+g4Kg1yQNQ2IQvmo0CHWqwlhAk8v1
3o2C68rjZcjDBg59kRB90OiRUrU8rEomcy6iLjx3yNhNLaSfVEbx+GpklRujU/4Y
D4x8coecVyorcT+91QzznVzTd7+oHR4QXbZ7jlWBAoGAYxYxy1658KWf1MS6AMQI
nEPG9zIyh0lGxxXpESQyXXPO6/+6rr/tlajJOdO7m/vmQV0hpJSpCXq177zp4cXO
RIzHv6Sf9rdebdH+lyzlXcJTeH2LZznG/AYUdX/1QLGgTk0mqM6yKTtXscmq52On
JtLtT8qn4E/Ml9gk9ATu81ECgYEAl5m7+hAbtiniIecYnuuAQnm3QjbJn+L54iwr
p+6g5op8eBsqMFYN0Kmmu5yDghNQxmiM+Q9xrt2a2ynabaZLJyqQfhgPCZ+3XDrW
M55p8V3ctSFCR1KhpHSwG4KC1BaFRNFWvLPS1NGfpiZ+UD/NVE7sYcd1QJW+Sm5N
uEIOpoECgYBXSNQYDuh+SLfTQNlKI+5dUUs9MrL0FIxGyQRMcejAhK6NhbYmq8yc
DDfCV+8s5B+OPI9jIn5vrv2qmGKzf6IYYtqLaW0eTLbiaTtunMvC35sUcgX0Ir2j
LnKDdGBcj6UKpcbr3JUdY+hEyo+jwv1xI1089V1/Jvcpih59Wn2IkA==
-----END RSA PRIVATE KEY-----
{% endhighlight bash %}

You might be wondering where the public key is. After all, we are generating a public/private key pair. The private key actually contains the public key. To extract it, you can use the following command:

{% highlight bash %}
openssl rsa -in private-encrypted.key -pubout
{% endhighlight bash %}

After entering your passphrase to decrypt the private key, you will your public key.

{% highlight bash %}
Enter pass phrase for private-encrypted.key:
writing RSA key
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAo67Ja4+JLCZiV9UU2V5D
QeRpuObFDOc1pAnzr4yiwx2nHLyVsjbIaCml/hSFg0ikt4sw6jTz9IwMhQpk0SK1
JgS8hPYABCNVQ+j8DDacaxtUJBFC0goWFdbOUIs9uo+ePLLdfYTkuOmnRYoj2L3X
pHAFSqLJQydcKnFUmaKWWG8rRocvpwI6Gf8LZsgpnz9OuE06fE8T6lHyEE4UwOwZ
mp4EJUDCa2Alzc9VvmFVWgMmM+IAucQUBrNZvTtzNxcws1JSc9kU/2fKxc6NbXAJ
JmIU5S0lV/W/9K+Iz+2OpT/tlHYtt+2rLt5rOH51r2MO16dd+Fvidqwz7lg3qKNz
GQIDAQAB
-----END PUBLIC KEY-----
{% endhighlight bash %}

I am sharing these keys to show you what you can expect to see when you generate your keys. These keys are not in use anywhere are were merely generated as a demonstration. You should *never share your private key*; however, your public key can be shared publicly. That is its purpose.

#### Generating a Certificate Signing Request

A Certificate Signing Request (CSR) is a document that represents a formal request for a certificate from a certificate authority. The CSR document consists of the public key and the identifying information about the entity requesting the certificate. When a user submits a CSR to a CA, the CA will validate the identity of the requester (typically by emailing an address associated with the domain). Once the identity is validated, the certificate it issued.

Fortunately, there are not too many decisions that need to be made when generating a CSR; however, there is one very important decision regarding the hashing algorithm used to digitally sign the certificate. When you generate a CSR, you need to provide a digital signature for the certificate. There are a number of algorithms that can be used to do this (e.g., MD5, SHA-1, SHA-256). The authenticity of your certificate will depend on the digital signature that you request in your CSR.

Google [recently announced](http://googleonlinesecurity.blogspot.com/2014/09/gradually-sunsetting-sha-1.html) that they will be downgrading the security display of sites that use certificates signed with SHA-1 or weaker algorithms. For our decision making process, this means that we should be creating our CSRs with a SHA-256 digital signing algorithm. This will help us avoid attacks based on [hash collisions](https://konklone.com/post/why-google-is-hurrying-the-web-to-kill-sha-1). While I am trying to frame this as a decision, there is very little to decide here; you need to sign your CSR using SHA-256 otherwise your site will eventually not work with modern browsers.

Additionally, you will need to make decisions about what information you provide in the request. The identity information will be publicly available and includes:

* Country Name
* State or Province Name
* Locality Name
* Organization Name
* Organizational Unit Name
* Common Name
* Email Address
* A challenge password

While CAs may vary on their requirements, you are typically only required to provide your common name, which is your fully qualified domain name. Most CAs will cover the "www" and "non-wwww" variants of a domain if you provide the "www" variant in the CSR.

To complete the CSR, use the following `openssl` command:

{% highlight bash %}
openssl req -new -sha256 -key private-encrypted.key -out csr.csr
{% endhighlight bash %}

When prompted for information, fill in any information that you would like to provide. Note that if you wish to provide a blank response, use `.` as your response. Leaving the field blank (i.e., hitting enter without entering `.`) will enter `openssl`'s default value, which you absolute do not want. I also recommend not entering a challenge password. If you do, this value is publicly available in the CSR and it is not commonly used. There may be a CA that requests, it but that is not common.

To view the CSR in a human readable format, use the following `openssl` command:

{% highlight bash %}
openssl req -text -in csr.csr -noout
{% endhighlight bash %}

This command will reveal the text of the the CSR. I think it is really important to view this text as it will clearly articulate to you what you are sending the CA when you pass along your CSR. The text will look something like:

{% highlight bash %}
Certificate Request:
    Data:
        Version: 0 (0x0)
        Subject: CN=www.tollmanz.com
        Subject Public Key Info:
            Public Key Algorithm: rsaEncryption
            RSA Public Key: (2048 bit)
                Modulus (2048 bit):
                    00:d8:33:65:77:af:87:a3:3c:27:47:5a:a6:3b:b7:
                    98:a5:69:75:31:63:b8:5d:e4:ea:f8:b4:3c:4d:03:
                    fd:a5:82:88:cd:1c:99:2d:a1:54:11:cf:8c:93:b7:
                    7a:d3:dc:81:bf:be:11:83:86:81:6a:1e:79:fa:10:
                    4c:f6:75:52:9a:03:f3:35:4a:ee:25:4a:1e:1b:cf:
                    a9:e3:66:df:70:69:ff:46:ef:32:aa:b1:6b:06:c0:
                    a4:ac:c9:7f:79:10:8b:02:28:3d:a5:df:d4:56:36:
                    62:1f:d5:49:b8:04:53:8c:03:df:be:c6:b7:83:78:
                    9a:69:60:13:13:50:4d:4e:d5:5b:96:4b:9b:ca:8a:
                    00:bb:ff:d1:9b:a2:3c:a9:d6:f7:b7:da:a5:05:f0:
                    5f:2f:6e:63:af:1a:5c:b5:f3:70:1d:c1:eb:7c:7d:
                    fd:9b:9f:10:c2:19:c2:e4:5c:d1:2f:8e:03:b5:66:
                    b8:67:25:46:24:77:be:90:86:0f:5d:ed:2d:10:38:
                    00:f5:88:17:e3:d4:42:02:87:cf:f2:80:12:5b:58:
                    8a:e5:d0:80:79:f3:51:d4:82:26:0d:8c:6c:b9:0f:
                    1a:3e:34:07:c5:4e:6a:65:e3:71:55:78:ab:10:9e:
                    c4:f6:99:73:05:ef:b8:40:69:40:8d:64:f6:c6:35:
                    c5:83
                Exponent: 65537 (0x10001)
        Attributes:
            a0:00
    Signature Algorithm: sha256WithRSAEncryption
        6d:33:27:28:87:c1:b2:93:98:41:f6:bb:f4:4b:7f:88:63:72:
        c8:b3:c8:2b:3b:69:81:92:e3:9f:9d:59:25:6c:29:21:8a:9f:
        f2:c9:c5:9b:eb:7d:6b:b2:a4:93:22:79:ab:90:71:cd:7b:d4:
        a1:7e:ae:c8:bd:b6:2d:69:f3:71:f2:d3:7b:0b:aa:d9:81:e7:
        82:44:00:99:e6:e5:d7:cc:93:0b:80:4c:7f:70:ab:bb:62:4c:
        af:dd:f0:de:f6:8a:d7:60:27:64:2e:69:b5:ad:e6:91:92:6b:
        a1:a1:67:83:28:20:17:50:4f:46:c7:aa:6f:31:91:34:d7:5f:
        de:39:1c:a9:8d:a5:02:d2:7a:58:bc:61:98:df:c4:0e:c1:ff:
        34:8a:ea:d1:5d:4b:ae:82:4a:f6:87:43:ca:e3:e3:1c:17:e0:
        c4:ad:14:9b:ea:d7:e8:be:06:0f:ae:d4:dd:40:55:17:4b:f0:
        83:b6:10:da:45:c2:57:59:80:4c:21:b9:c7:93:7e:eb:51:98:
        d7:be:7c:a4:1d:2b:b9:4e:9f:73:46:a4:b4:48:16:29:be:38:
        ec:c2:cf:b2:54:05:52:5e:ec:41:59:fc:57:90:62:a5:5c:79:
        e9:bf:02:89:2d:28:72:8a:15:88:a3:81:4e:c4:c0:d7:d0:d9:
        bd:07:c2:b7
{% endhighlight bash %}

With our CSR in hand, we can pass it along to a CA in exchange for a certificate.

#### Sending the Certificate Signing Request to a Certificate Authority

Fortunately, the last step in this process is relatively easy. The CSR that you painstakingly prepared needs to be sent to your CA of choice. The CSR submission processes for CA's vary greatly. Most will involve sending the CSR through an online form followed by a verification process typically involving an email sent to an address associated with the domain that the certificate is being created for.

At the end of the process you will receive your certificate. Depending on the CA, you may also receive different bundles of certificates. You will want to gather the certificate for your domain along with *all of the CAs intermediates*, but *do not include the root certificate*. The root certificate is available to the browser. If you bundle this certificate to be sent with the other certificates, it is extra bytes on the wire because it is not needed given that the certificate is already available to the browser.









Might be able to use this for key exchange. I wrote it for the key algorithm stuff, but realized that it does not really apply:

During the TLS handshake, the client and server will need to agree on a shared master secret that they will use to encrypt future communications. To generate the master secret, the client needs to send some encrypted data to the server. This initial data is encrypted using the public/private key pair created during this step. How the data is encrypted is determined by the decision you make for what key algorithm to use.

I want to pause for a minute to reiterate and clarify what I said in the previous paragraph. This concept is one of the more confusing concepts to wrap your head around. Right now, we are discussing the decisions that need to be made to create a sufficiently strong public/private key pair to utilize for generating a certificate. The private key will be used in your TLS deployment. It is extremely important to note that this key is only used to encrypt data during the key exchange process of the TLS negotiation. When the application data (i.e., the HTML, CSS, JS, etc.) is encrypted, *it is not using the public/private key*. This pair is used to negotiate a key that is used to encrypt data between the client and the server. You are generating a key that encrypts data that is used to generate a key to encrypt data. This is really confusing, but I want to be clear that this key is not the one used in encrypting the application data. That said, the private key must remain private because if compromised, it can be used to generate the negotiated keys in certain circumstances.

<p class="footnote"><span class="footnote-footer-number">1</span> Many thanks to Eric Mill's excellent article <a href="https://konklone.com/post/switch-to-https-now-for-free"><em>Switch to HTTPS Now, For Free</em></a> that provided me with this simple one-liner for generating an RSA public/private key pair.</p>

