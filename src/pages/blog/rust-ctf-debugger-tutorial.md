---
title: 'Rust CTF Challenge: Debugger Tutorial'
date: 2023-12-05
tags: ['rust', 'ctf', 'debugger']
---

![ctf-thumbnail](/images/rust-ctf-debugger-tutorial/ctf-thumbnail.jpg)

The image is used under the CC BY 2.0 DEED license. ((The image by Lydia Liu is used under the CC BY 2.0 DEED license. [Campers Playing Capture the Flag](https://www.flickr.com/photos/lydiaxliu/14816140460/in/photolist-ozfAnA-ozfMZw-ozjwSi-ozjwUn-ozjxcX-oPHn87-oPLEf7-oRtoaD-oRwDnB-oRHiZY-oRKbZK)))

# 1. Introduction

This is the article for December 5th of the University of the Ryukyus Intelligence Information Advent Calendar 2023.

On December 1st, I had a task of reading binaries in [Personal Interest in Rust and Wasm](https://yoshisaur.hatenablog.jp/entry/2023/12/04/080434), which was surprisingly fun, so this time I'm going to create a CTF (Pwn) problem in Rust and solve it using rust-lldb to learn how to use a debugger.

We will analyze binary files for the x86_64 architecture.

# 2. What is a Debugger?

A debugger is a tool that controls the execution of a program, identifies bugs and errors, and corrects them. With a debugger, you can execute a program step by step, pause the execution of a program under certain conditions, and check the values of variables.

A debugger is an important tool for understanding the behavior of a program, identifying problems, and solving them. Especially when debugging complex problems or unexpected behavior, the use of a debugger is almost essential.

The debugger we will handle this time is a source-level debugger. Source-level debuggers include gdb for GCC-based compilers and lldb for LLVM-based compilers.

Rust is based on LLVM, and provides a debugger called rust-lldb.

# 3. What is CTF?

CTF (Capture The Flag) is one of the competitions to compete for computer security skills. Participants solve various security problems and earn points by finding a specific string called "flag". The problems are divided into various categories such as Web security, cryptography, network security, disassembly, binary analysis, etc.

The CTF problem we will create this time is a category called Pwn problem.

Pwn problems are problems that test binary analysis and exploit creation skills. You analyze the given binary and get the flag by exploiting the vulnerability of that binary.

# 4. Let's actually solve it

I have prepared a [binary download page](https://ie.u-ryukyu.ac.jp/~e205723/ctf_problem_0/). Please download from here.

## 4.1. Check the contents of the problem

You can execute it with `$ ./behemoth0`. 

If execution permission is not granted, please execute `$ chmod 755 behemoth0`.

```txt
$ ./behemoth0        
Please enter your password:
```

You will be prompted to enter your password like this.

You can expect to receive some reward if you enter the correct password.

## 4.2. Try extracting strings with the strings command

The `strings` command is a Unix system command for extracting ASCII strings from binary files and other types of files. This command displays the printable strings in the file. This is particularly useful when investigating the contents of binary files.

Let's actually run it and extract the strings.

```txt
$ strings behemoth0

...omitted
/rustc/5680fa18feaa87f3ff04063800aec256c3d4b4be/library/core/src/alloc/layout.rsattempt to divide by zeroIEXXOI^BEXYOHK^^OXSY^KZFOPlease enter your password: src/main.rs
qwerty12345answer'Answer'? Well, aren't we playing the philosopher today!
'12345'? I see, you've mastered the art of counting!
Oh, 'qwerty'? How original!
As if it would be that easy!
Oh, choosing to remain silent? How intriguing!
Access denied. Try again.
...omitted
```

In this way, you can extract strings such as `password`, `qwerty`, `12345`.

Let's actually enter it.

```txt
$ ./behemoth0
Please enter your password: password
As if it would be that easy!
Access denied. Try again.
Please enter your password: qwerty
Oh, 'qwerty'? How original!
Access denied. Try again.
Please enter your password: 12345
'12345'? I see, you've mastered the art of counting!
Access denied. Try again.
```

The password was rejected with a sarcastic remark.

Spoiler alert, there is no correct answer by entering the strings that can be extracted with the `strings` command as a password.

It seems that the correct password is not written in plain text in the implementation code.

## 4.3. Analyze with a debugger

We found that this problem cannot be solved with the `strings` command.

The correct password is probably generated dynamically at runtime.

In this case, we use a debugger that can examine variables in memory while executing the binary file.

Execute the following command.

```txt
$ rust-lldb behemoth0
```

The fact that the password is being verified means that there must be a process somewhere that compares strings.

In C language, there is a function like `strcmp`, but in Rust, string comparison is done with the `==` operator.

The `==` operator evaluates the equivalence of two values by calling the `eq` method of the `std::cmp::PartialEq` trait. (Refer to the [Trait std::cmp::PartialEq documentation](https://web.mit.edu/rust-lang_v1.25/arch/amd64_ubuntu1404/share/doc/rust/html/std/cmp/trait.PartialEq.html))

We will set a breakpoint at the point where the `eq` method is called.

A breakpoint is a specified point where the debugger temporarily stops the execution of the program. By setting a breakpoint, you can check the value of variables at that point and execute the program step by step.

In rust-lldb, which is a debugger for Rust, we use the `b` (`breakpoint set --name`) command to set breakpoints. We will set a breakpoint at the point where the `eq` method is called as follows.

```txt
(lldb) b eq
Breakpoint 1: 60 locations.
```

The output indicates that functions or methods named `eq` are used in 60 places in the program, and breakpoints have been set at all of these places.

Once the breakpoint is set, run the program with the `r` (`run`) command. When asked for the password, enter an arbitrary value. After entering the password, it will be executed until the `eq` method is called.

```txt
(lldb) r
Process 3493 launched: '/Users/yoshisaur/workspace/blog/20231205/behemoth0/target/debug/behemoth0' (x86_64)
Please enter your password: password
Process 3493 stopped
* thread #1, name = 'main', queue = 'com.apple.main-thread', stop reason = breakpoint 1.2
    frame #0: 0x00000001000057a4 behemoth0`_$LT$alloc..string..String$u20$as$u20$core..cmp..PartialEq$GT$::eq::h76fa5ff4362a6554(self=0x00007ff7bfefecb0, other=0x00007ff7bfefec60) at string.rs:366:5
Target 0: (behemoth0) stopped.
```

At the point where the `eq` method is called, use the `fr v` (`frame variable`) command to display the variables of the current frame. This command displays all variables of the current stack frame.

```txt
(lldb) fr v
(alloc::string::String *) self = 0x00007ff7bfefecb0
(alloc::string::String *) other = 0x00007ff7bfefec60
```

This indicates that two variables, `self` and `other`, are pointing to specific addresses in memory. It is natural to think that `self` represents the entered password and `other` represents the correct password.

However, these are just memory addresses, so no direct information can be obtained. Therefore, you need to use additional debugger commands to see the actual strings these addresses point to.

Specifically, use the `p` (`print`) command to display the strings these variables point to.

```txt
(lldb) p *other
(alloc::string::String) $0 = "Spoiler prevention" {
  vec = size=25 {
    Spoiler prevention
  }
}
```

I omitted it because it's not fun to spoil the answer. Please actually enter it and get the reward.

Once you have finished working with the debugger, please exit the debugger with `q`(`quit`).

## 4.4. Why the strings command was not effective

We have been able to analyze the password, which is enough, but I also want to investigate with a debugger why we could not extract strings with the `strings` command.

The reason why we could not extract strings with the `strings` command is that we can assume that the correct password string is dynamically generated at runtime.

If the password is generated dynamically, there must be a function or method that generates the string.

Let's start looking from within the `main` function.

Since the output is long, I recommend writing the output to a text file first and then searching.

You can display the output on the console while writing to a text file with `$ rust-lldb behemoth0 2>&1 | tee session.txt`.

Please disassemble the `main` function by executing `disassemble --name main` in lldb. (Disassemble refers to converting binary code (machine language) into human-readable assembly language.)

Once you have executed it, exit lldb and execute `$ grep "callq" session.txt | less`.

This command searches for lines containing the string `callq` from the session.txt file and displays the results with the `less` command. `callq` is an instruction that represents a function call in x86_64 architecture assembly language. In other words, this command is used to search for all functions called within the `main` function.

```txt
behemoth0[0x100004cf7] <+55>:   callq  0x100004c60               ; behemoth0::memfrob::h0a7613b04ef7d854 at main.rs:3
.
.
.
Omitted
.
.
.
behemoth0[0x100005263] <+19>: callq  0x100004be0               ; std::rt::lang_start::h8203cbc8150ed6fb at rt.rs:159
```

There should be a function that generates a string among these function calls.

Of particular note is the function `behemoth0::memfrob::h0a7613b04ef7d854`.

Since the `behemoth0` crate defines the `memfrob` function on its own, there is a possibility that special processing not implemented in the standard crate is being performed.

By the way, the part `h0a7613b04ef7d854` is a unique identifier generated by Rust's name mangling. In Rust, name mangling is performed at compile time to uniquely identify function names and variable names. This allows each function or variable with the same name to be uniquely identified, even if they are defined in other scopes.

Set a breakpoint at the point where the `memfrob` function is called in lldb and run it.

```txt
(lldb) b memfrob
Breakpoint 1: where = behemoth0`behemoth0::memfrob::h0a7613b04ef7d854 + 46 at main.rs:4:5, address = 0x0000000100004c8e
(lldb) r
Process 4695 launched: '/Users/yoshisaur/workspace/blog/20231205/behemoth0/target/debug/behemoth0' (x86_64)
Process 4695 stopped
* thread #1, name = 'main', queue = 'com.apple.main-thread', stop reason = breakpoint 1.1
    frame #0: 0x0000000100004c8e behemoth0`behemoth0::memfrob::h0a7613b04ef7d854(input="暗号化前の文字列") at main.rs:4:5
   1    use std::io::{self, Write};
   2
   3    fn memfrob(input: &str) -> String {
-> 4        input.bytes().map(|b| (b ^ 42) as char).collect()
   5    }
   6
   7    fn main() {
Target 0: (behemoth0) stopped.
```

I got a spoiler from the Rust code output, but let's read it anyway.

From the output code, we can see that the `memfrob` function returns a new string that is the result of XORing each byte of the string with 42.

Let's pretend we didn't see the Rust code and discover with the debugger alone that the `memfrob` function is dynamically generating the correct password.

Let's output the variables of the frame at the point where the `memfrob` function is called.

From this output, we can see that a string (whether it's related to the password is undetermined) is being passed to the input argument of the memfrob function.

Let's use the `finish` command to continue executing the program until the current function ends, and let's run it until the `memfrob` function ends.

```txt
(lldb) finish
Process 5021 stopped
* thread #1, name = 'main', queue = 'com.apple.main-thread', stop reason = step out
Return value: (alloc::string::String) $0 = "Spoiler Prevention" {
  vec = size=25 {
      Spoiler Prevention
  }
}

    frame #0: 0x0000000100004cfc behemoth0`behemoth0::main::h537f6aedbc8cd8a6 at main.rs:12:9
   9        let frobbed_password = memfrob(secret_password);
   10
   11       loop {
-> 12           print!("Please enter your password: ");
   13           io::stdout().flush().unwrap();
   14           let mut input = String::new();
   15           io::stdin().read_line(&mut input).unwrap();
Target 0: (behemoth0) stopped.
```

We have discovered that the `memfrob` function is dynamically generating the correct password.

With this, we have been able to investigate why the password could not be found by statically analyzing the strings from the binary with the strings command.

# 5. Rust Code

This problem was implemented with the following code.

```rust
use std::io::{self, Write};

fn memfrob(input: &str) -> String {
    input.bytes().map(|b| (b ^ 42) as char).collect()
}

fn main() {
    let secret_password = "Spoiler Prevention";
    let frobbed_password = memfrob(secret_password);

    loop {
        print!("Please enter your password: ");
        io::stdout().flush().unwrap();
        let mut input = String::new();
        io::stdin().read_line(&mut input).unwrap();
        input = input.trim().to_string();
        match input.as_str() {
            _ if input == frobbed_password => {
                let output = memfrob("Spoiler Prevention");
                println!("{}", output);
                break;
            }
            "" => println!("Oh, choosing to remain silent? How intriguing!"),
            "password" => println!("As if it would be that easy!"),
            "qwerty" => println!("Oh, 'qwerty'? How original!"),
            "12345" => println!("'12345'? I see, you've mastered the art of counting!"),
            "answer" => println!("'Answer'? Well, aren't we playing the philosopher today!"),
            _ => println!("Access denied. Try again."),
        }
    }
}
```

The seemingly unnecessary password pattern matching and taunting phrases were written to confuse those who are trying to solve the problem using the output of the `strings` command.

In Rust, it's difficult to create a CTF problem using a program that causes a buffer overflow ((in the first place, it can't be created on a processor that supports execution prohibition bits such as NX bit, XD bit)), but you can create a reverse engineering problem using a debugger.

By the way, there is a `memfrob` function implemented as a joke in the GNU C library. The `memfrob` function in the GNU C library does exactly the same processing as this Rust code function. This time, it was difficult to directly call the GNU C library in Rust, so I implemented it myself.

# 6. Source of the CTF Problem I Referenced

The content of the problem was created with reference to the permanent CTF [behemoth](https://overthewire.org/wargames/behemoth/) by OverTheWire. It's easy to challenge and very fun, so please try to solve it as well.

# 7. Conclusion

In this article, we learned and practiced how to use a debugger by solving a CTF created in Rust using rust-lldb.

I hope this has been a learning experience for those who don't often touch debuggers.

Actually, if you solve the problem in this article, a reward output will be displayed on the console. Please DM it to me. I'll be happy.

Thank you very much for reading to the end.
