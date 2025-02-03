---
title: A Reasonably Simple, Secure Password Scheme
permalink: a-reasonably-simple-secure-password-scheme
thumbnail:
featured: true
tags: [Password, Security, Diceware, PWGen]
excerpt: 'In this article you will learn a reasonably simple password scheme that you can use across many services without worrying about your passwords being hacked, because we never have to store the passwords anywhere, even on paper.'
authors: [F1LT3R]
type: article
---

# A Simple Password Scheme

Are online password generators and password library systems  really safe and secure?

With a across-site attack, someone may be able to read the password you are generating online. And hackers can and do attack centralized password library databases, to steal the database files and crack as many of the passwords as possible. 

This happened to the password service LastPass in 2022: https://techcrunch.com/2022/12/22/lastpass-customer-password-vaults-stolen/

In this article you will learn a reasonably simple password scheme that you can use across many services without worrying about your passwords being hacked, because we never have to store the passwords anywhere, even on paper.

## Requirements

1. A linux terminal.
2. The `dicewords` program.
3. The `pwgen` program.
4. Stickers (or other device name system).

## Installation

```sh
sudo apt install diceware pwgen
```

## Generate A Scheme Passphrase

The goal is to come up with a password with the following properties:

- Easy to remember (simple, memorable words or phrase)
- Hard to brute-force (high entropy)

### Diceware
 
1. Install the `Diceware` utility if you do not have it already:

    ```sh
    sudo apt install diceware
    ```

2. Now use `Diceware` to generate a 7 word phrase with a couple of special characters thrown in:


    ```sh
    diceware -n 7 -d " " -s 2
    ```

    - `-n 7` - Number: Select seven random words.
    - `-d " "` - Delimiter: separate the words with a space.
    - `-s 2` - Special Chars: Change two characeters to special characters.

    The resulting output should be something like:

    ```plaintext
    Idealness Revivi5g Delir$ous Presuming Badge Straggler Sworn
    ```

    > **NOTE:** the two special characters above are `5` and `$`. These characters raise the entropy of your password, making it hard to brute-force.


### Storing Your Scheme Passphrase

Seven words and two special characters should be easy enough to memorize. If you **have** to write it down to remember the phrase, my suggestion is to follow these three basic rules:

1. Only keep it written down for a month or so.
2. Keep the paper you've written it on under locked and key.
3. When you have memorized the passphrase, burn the paper.

It shouldn't take you long to memorize, as you will be using it fairly often when you need to log into a service, or system.


## The Password Scheme

With this reasonably simple password scheme, you only have to remember five things:

1. `PASSPHRASE` - Your Scheme Passphrase, as generated above.
2. `DOMAIN` - The name of the device, domain or service you are using.
3. `IDENTITY` - The username, email, or phone number you use with that device, domain, or service.
4. `LENGTH` - The length of the password for your domain. Some passwords systems are limited in length.
4. `MODE` - The mode is either `SIMPLE` (uses basic characters), or `COMPLEX` (uses lots of special characters). Some password systems to not allow complex passwords.


You can visualize your password scheme this way:

```plaintext
PASSPHRASE > DOMAIN + IDENTITY < [LENGTH, MODE] 
```


### `PASSPHRASE`

Your `PASSPHRASE` is the Scheme Passphrase you used above.

### `DOMAIN`

The `DOMAIN` is the thing your are using your passphrase to log into. The `DOMAIN` can be a physical computer, a web domain, a physical or virtual disk,etc.

Naming your domain is easy, just take the web address of the service you are using, for example: "`twitter.com`".


#### Naming Physical Devices

You may want to commit the names of your devices to memory, such as `Backup-Disc-1` or `Main-Computer`. But if you have a lot of physical devices that require a password, you may want to use a naming strategy.

**Example**

I encourage you to generate your own device naming system that is most memorable for you. But here is an example to help get you thinking:

1. Buy an assortment of stickers: letters, numbers, color dots, animals, plants, spaceships, cartoon characters, etc.
2. Give each device one or more stickers.
3. Generate a name from the stickers you placed on the device, for example: if you placed a red dot sticker, a gopher animal sticker and a number 2 sticker to the device, it's `DOMAIN` might be something like: "`RedGopher2`"

> **NOTE:**  You may use multiple passwords to log into a computer system if you have set a BIOS password, or use disc encryption. In this case you can add this detail to your `DOMAIN`, eg: "`RedGopher2-BIOS`".


### `USER`

The `USER` is simply the username you use when logging into a particular domain. 

For a website or service, your `USER` will be your email address or username.

For a physical computer system, your `USER` will be the main username you use to log into the operating system.

For a physical disk, your `USER` can just be "`user`" or your name.


### `LENGTH`

Some websites and computer BIOS passwords are limited in the length of characters allowed, and also the complexity of special characters allowed. So the length of the password will be subject to the password system you are logging into.

My suggestion is to only use two or three `LENGTH` + `MODE` pairs where possible to reduce the complexity for memorization.

For example:

1. `LENGTH=64` + `MODE="COMPLEX"`

    1. Disk Encryption Passwords
    2. Most Website Passwords

    Example:

    ```plaintext
    x1THK''[zH5=>VJylQfJs9EK4[[/w.q*#U4;bP=pRw9++?\-MK#"Z(ND=UhY=\vH
    ```

1. `LENGTH=16` + `MODE="SIMPLE"`

    1. BIOS passwords
    2. Poorly designed website passwords
    3. Mobile passwords

    Example:

    ```plaintext
    en8ae4Poh0Fahgh5
    ```

> **NOTE:** While many BIOS systems will allow a long, complex password; they may be very time consuming to type into a terminal where you are unable to copy + paste the password. It is sometimes acceptable (as a necessary limitation) to use a short, simple password for these password checkpoints.


### Scheme Table

Let's say you want to log into your desktop computer, then log into an external drive, and finally log into Twitter. Your Scheme Table might look like this:


| Device | Checkpoint | Domain | Identity | Length | Complexity | 
| --- | --- | --- | --- | --- | --- |
| Desktop Computer | BIOS Password | `RedGopher2-BIOS` | `"user"`      | 16 | `SIMPLE`  |
| Desktop Computer | Disk Password | `RedGopher2-DISK` | `"user"`      | 16 | `SIMPLE`  |
| Desktop Computer | OS Password   | `RedGopher2-OS`   | `"user"` | 16 | `SIMPLE`  |
| External Disk    | Disk Password | `BlueDuck3`       | `"user"`      | 64 | `COMPLEX` |
| Twitter          | Web Password  | `twitter.com`     | `"me@domain.com"`       | 64 | `COMPLEX` |


## Generating Passwords to Scheme

Using the Password Scheme Table above, let's generate a set of passwords.

To generate a `SIMPLE` password for the Desktop Computer's BIOS we use `pwgen` with a `SEED`. The `SEED` is used to generate the password, meaning the password will always be easily recoverable by remembering the `PASSPHRASE` + `DOMAIN` : `USER` with the `LENGTH` and `MODE`.

```bash
PASSPHRASE='Idealness Revivi5g Delir$ous Presuming Badge Straggler Sworn'
DOMAIN='RedGopher2-BIOS'
USER='user'
SEED="$PASSPHRASE+$DOMAIN:$USER"

# Use the seed to generate a password
pwgen 16 1 -H <(echo "$SEED") -cn

# OUTPUT: "cheekuCho2quaula"

# Clear sensitive variables from memory (or close terminal)
PASSPHRASE=DOMAIN=USER=""
```

> **CHALLENGE:**  
> Try generating the password using the information above. Do you get the same output: "`cheekuCho2quaula`"?  
>  
> You should!   
>  
> Try changing one of the words and getting a new password output. Then switch the word you changed, back to it's original word, and you should get your original generated password back again: "`cheekuCho2quaula`".

We can do the same again for the `COMPLEX` passwords with a `LENGTH` of 64 characters:

```bash
PASSPHRASE='Idealness Revivi5g Delir$ous Presuming Badge Straggler Sworn'
DOMAIN='twitter.com'
USER='me@domain.com'
SEED="$PASSPHRASE+$DOMAIN:$USER"

# Use the seed to generate a password
pwgen 64 1 -H <(echo "$SEED") -cnsy

# OUTPUT: "cheekuCho2quaula"

# Clear sensitive variables from memory (or close terminal)
PASSPHRASE=DOMAIN=USER=""
```

The parameters we changed were:

- "`pwqgen 64`" - Produce a 64 character length password.
- "`pwgen -s`" - Create a secure password with complex high entropy character set.
- "`pwgen -y`" - Use symbol/special characters.


### Processing The Whole Table

When we apply the the logic above to the whole Scheme Table, we get the following output:

| Device | Checkpoint | Password | 
| --- | --- | --- |
| Desktop Computer | BIOS Password | "`cheekuCho2quaula`" | 
| Desktop Computer | Disk Password | "`iGahghoog9Ahgh7N`" |
| Desktop Computer | OS Password   | "`ahghun7Shauweew0`"   |
| External Disk    | Disk Password | "`yN2F/_T}&#!Y68^_q%ZmoYt]xc?l%qf<<!(u,:hc%Od\|j}HsKy7?}nZ7XU[vj!-,`"       |
| Twitter          | Web Password  | "``z12-Qxyg{s9Ua~g0bAUG`N-pm7NAujx4hno<C(5\asM4]/`xg0^tCjK$06q=8gCn``"     |


## Using a Generator Script

To make it easy to retrieve your passwords quickly, you can create a generator script within your bin `$PATH`. We will simply name our generator script "`pass`". Don't forget to run `chmod +x ./pass`, to make the generator executable.


```bash
#!/bin/bash

# The first arg is your DOMAIN:USER (string)
if [ -z "$1" ];
    then echo "You must provide a DOMAIN:USER, eg: 'twitter.com:me@domain.com'"; exit 1;
    else DOMAIN_USER="$1";
fi

# Use a secure password entry for your PASSPHRASE
echo -n Enter your PASSPHRASE: 
read -s PASSPHRASE
echo

# The second arg is password LENGTH
if [ -z "$2" ];
    # Default to 64 characters for most passwords
    then LENGTH=64;

    # We can pass a custom length, "16", for our working example
    else LENGTH=$2;
fi

# The third argument is our MODE
if [ -z "$3" ];
    # Default to SECURE for most passwords
    then MODE="SECURE";

    # Providing any input, eg: [y, true, simple] -sets MODE to SIMPLE
    else MODE="SIMPLE";
fi

# Create our recoverable SEED
SEED="$PASSPHRASE+$DOMAIN_USER"

# Generate password based on LENGTH, SEED and MODE
if [ "$MODE" == "SIMPLE" ];
    then PASS=$(pwgen $LENGTH 1 -H <((echo $SEED)) -cny);
    else PASS=$(pwgen $LENGTH 1 -H <((echo $SEED)) -cnsy);
fi

echo $PASS
```

Using our "`pass`" script we can generate our Twitter password as described in the examples above. You will be asked to enter your `PASSPHRASE`. As you type your `PASSPHRASE` out, your characters will be hidden.

```bash
pass 'twitter.com:me@domain.com'

Enter your PASSPHRASE:

# OUTPUT: z12-Qxyg{s9Ua~g0bAUG`N-pm7NAujx4hno<C(5\asM4]/`xg0^tCjK$06q=8gCn
```


## Further Strategies to Consider

### Memorable Words

Make sure you pick words that are memorable to you!

Try to pick words that have some meaning to your life. This will make them much easier to remember. This is especially true if the commination of your words tell some kind of story.


### Only Four Words for Beginners

For beginners: consider keeping your `PASSPHRASE` to four words.

Keeping your `PASSPHRASE` to four words will make this simple password scheme easier to use and quicker to memorize. When you are comfortable with this simple password system, consider upgrading to seven words.


### Using a `SALTWORD`

You may want to add a `SALTWORD` to your `DOMAIN`:`USER` string for extra obfuscation:

```bash
pass 'twitter.com:me@domain.com+FOOBAR'
```

You can easily change your `SALTWORD` to be individualized to a `DOMAIN`, or use the same `SALTWORD` across multiple domains. Just make sure you create a memorable scheme for your saltwords if you use them.


### Single Domain Breech

If you learn that a hacker has breeched any given domain, you can add a `SALTWORD` for the specific domains that were breeched.


### Multiple Domain or `PASSPHRASE` Breech

If you learn, or suspect that someone has gained access to your `PASSPHRASE`, I would recommend taking the following action:

1. Generate a new `PASSPHRASE` if you're sure someone has all your words. Or you may want to change a single word in your `PASSPHRASE` if you only suspect someone has gain accessed to your words.

2. Create a table of your domains (like the one earlier in this document).

3. Use a bash script to run through your domains and generate a new set of passwords. Example:

    ```bash
    echo -n Enter your new PASSPHRASE: 
    read -s NEW_PASSPHRASE
    echo

    newPass () {
        if [ -z "$3" ];
            then PASS=$(pwgen $2 1 -H <(echo "$NEW_PASSPHRASE+$1") -cnsy);
            else PASS=$(pwgen $2 1 -H <(echo "$NEW_PASSPHRASE+$1") -cn);
        fi

        echo "$1: $PASS"
    }

    newPass "RedGopher2-BIOS:user" 16 SIMPLE
    newPass "RedGopher2-DISK:user" 16 SIMPLE
    newPass "RedGopher2-OS:user" 16 SIMPLE
    newPass "BlueDuck3:user" 64
    newPass "twitter.com:me@domain.com" 64
    ```

    After running the script with "`F0o Bar Ba$ Qux`" as your `PASSPHRASE`, you should see the following output:

    ```bash
    Enter your new PASSPHRASE:

    "RedGopher2-BIOS:user": piec5Oovaaloh8pe
    "RedGopher2-DISK:user": Iquathae5na3aL2m
    "RedGopher2-OS:user": ouSohS8pei3yee6i

    "BlueDuck3:user": ]v)Dy'rTSBbkwN7Dns=z<T0CZcID!D[Q42/i=q(nD@\Kg@/^mr0(f2"wQFsPC~>}

    "twitter.com:me@domain.com": >,D\-c.6'+G]-:!PIEeOp6?;B'yP=UsPzCu`rd6HSY0b}gtS^z61dZc;6Yp=Spg9
    ```

## Conclusion

Congratulations!

Now you can quickly recover a seeded password for any domain using a memorable `PASSPHRASE` on any system with `pwgen` installed.

If you learn of a breech you can update your passwords individually with a `SALTWORD`, or update all your all passwords with a new `PASSPHRASE`.

This password system is easy to remember, simple to use and only requires one tool to be installed (`pwgen`).

This password system does not rely on any centralized services prone to hackers, and if you're comfortable memorizing a few words, you never have to write any passwords down!