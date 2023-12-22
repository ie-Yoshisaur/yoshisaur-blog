---
title: 'WebAssembly: Understanding Stack, VM, and Binary Mechanics'
date: 2023-12-01
tags: ['webassembly']
---

## 1. WebAssembly

![](https://github.com/carlosbaraza/web-assembly-logo/blob/master/dist/logo/web-assembly-logo-512px.png?raw=true)

WebAssembly(Wasm) is a binary format that can be executed on any OS or CPU.

WebAssembly(Wasm) is described as follows on the [official page](https://webassembly.org/).

>WebAssembly (abbreviated Wasm) is a binary instruction format for a stack-based virtual machine. Wasm is designed as a portable compilation target for programming languages, enabling deployment on the web for client and server applications.

The phrase "binary instruction format for a stack-based virtual machine" is not intuitively understandable, so I will explain it in a more digestible way. It's quite interesting once you understand it.

### 1.1. What is "binary instruction format for a stack-based virtual machine"?

What does "binary instruction format for a stack-based virtual machine" mean? I will explain it by unraveling the terms one by one.

#### 1.1.1. "Stack"

"**Stack**" is a type of data structure that has the characteristic that data addition (push) and deletion (pop) can only be done from one direction. This characteristic is also called "Last In First Out" (LIFO).

The main operations of the stack are as follows:

- Push: Add new data to the top of the stack.
- Pop: Take out the data at the top of the stack and remove it from the stack.

I will explain how the stack is used specifically by giving an example of Reverse Polish Notation used in stack-based calculators and programming languages (RPN, Forth, PostScript).

Reverse Polish Notation is a way of writing where the operator is placed after the operand (number).

In other words, to give a concrete example, the expression `5 * (3 + 4)` is represented as `5 3 4 + *`.

The calculation is done as follows.

1. Push 5 onto the stack (Stack: 5).
2. Push 3 onto the stack (Stack: 5, 3).
3. Push 4 onto the stack (Stack: 5, 3, 4).
4. When you find +, pop 3 and 4 from the stack, add them, and push the result, 7, onto the stack (Stack: 5, 7).
5. When you find *, pop 5 and 7 from the stack, multiply them, and push the result, 35, onto the stack (Stack: 35).
6. When the expression ends, the 35 on top of the stack is the final result.

This is the flow of calculation using a stack. In fact, Wasm also does stack-based processing, so it does the same calculation as Reverse Polish Notation.

#### 1.1.2. "Virtual Machine"

A virtual machine provides compatibility between different OSs and CPU architectures. In other words, the virtual machine plays the role of "absorbing the architecture of the OS and CPU". Since Wasm instructions are executed on a virtual machine, this ensures that the same binary instruction format file operates consistently in different environments. This means that developers do not need to generate binary instruction format files individually for each environment, and the Wasm generated once can be executed in any environment.

I will explain the calculation flow on Wasm's virtual machine using the WebAssembly text format (wat). Wat is a text representation of WebAssembly's binary instruction format that humans can read and write. You can also convert from Wasm to wat.

Prepare a wat file like the following (file name: `calculate.wat`). The content is the function of the previous `5 * (3 + 4)` and made it `x * (y + z)`.

```txt
(module
  (func (export "calculate") (param $x i32) (param $y i32) (param $z i32) (result i32)
    local.get $x
    local.get $y
    local.get $z
    (i32.add)
    (i32.mul)
  )
)
```

The execution flow of this function is as follows:

1. The values of $x, $y, and $z are pushed onto the stack in order.
2. When the i32.add instruction is executed, the top two values ($z and $y) are popped from the stack, and their addition result is pushed onto the stack.
3. Then, when the i32.mul instruction is executed, the top two values (the addition result and $x) are popped from the stack, and their multiplication result is pushed onto the stack.
4. Finally, the value at the top of the stack (the multiplication result) is returned as the return value of the function.

The process flow is the same as the Reverse Polish Notation example I gave.

At this stage, since the wat file is ready, convert it and actually use the Wasm binary instruction format file.

Execute `$ wat2wasm calculate.wat` to generate `calculate.wasm`.

To use this wasm file, create an html file and a js file. Please place all in the same directory.

index.html
```html
<!DOCTYPE html>
<html>
<head>
    <title>WebAssembly Demo</title>
</head>
<body>
    <h1>WebAssembly Demo: x * (y + z)</h1>
    <input id="x" type="number" placeholder="Enter x">
    <input id="y" type="number" placeholder="Enter y">
    <input id="z" type="number" placeholder="Enter z">
    <button onclick="calculate()">Calculate</button>
    <p id="result"></p>
    <script src="main.js"></script>
</body>
</html>
```

main.js
```javascript
async function calculate() {
    const x = document.getElementById('x').value;
    const y = document.getElementById('y').value;
    const z = document.getElementById('z').value;

    const wasmModule = await WebAssembly.instantiateStreaming(fetch('calculate.wasm'));
    const result = wasmModule.instance.exports.calculate(x, y, z);

    document.getElementById('result').innerText = `${x} * (${y} + ${z}) = ${result}`;
}
```

Please execute `$ python3 -m http.server 8000`.

Open `http://localhost::8000` and input x = 5, y = 3, z = 4 to get the calculation result.

![wasm-demo](/images/wasm-stack-vm-binary/wasm-demo.png)

I think you will get a result like this image.

This means that you have successfully called Wasm from js. (Applause)

By the way, wasm can be loaded not only from js.

Let's load it in Rust as well.

Execute `$ cargo init rust-wasm`.

Add the following line to `Cargo.toml` (version is the latest at the time of blog publication)

```yaml
[dependencies]
wasmer = "4.2.4"
```

Create a `wasm` directory in `rust-wasm` and place the wasm file.

Write `main.rs` as follows.

```rust
use std::env;
use std::fs::read;
// Import the necessary things from wasmer. This is a library for handling WebAssembly.
use wasmer::{imports, Instance, Module, RuntimeError, Store, Value};

// Define the main function. If an error occurs, it returns the error.
fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Get the command line arguments.
    let args: Vec<String> = env::args().collect();
    // Parse the arguments into i32 type.
    let arg1 = args[1].parse::<i32>()?;
    let arg2 = args[2].parse::<i32>()?;
    let arg3 = args[3].parse::<i32>()?;

    // Load the WebAssembly binary.
    let wasm_bytes = read("./wasm/calculate.wasm")?;
    // Create a store. This holds the state of WebAssembly.
    let mut store = Store::default();
    // Create a module. This holds the code of WebAssembly.
    let module = Module::new(&store, &wasm_bytes)?;

    // Create an import object. This is used by WebAssembly to call functions from the host environment.
    let import_object = imports! {};
    // Create an instance. This holds the execution environment of WebAssembly.
    let instance = Instance::new(&mut store, &module, &import_object)?;

    // Get the "calculate" function from the exports.
    let calculate = instance.exports.get_function("calculate")?;
    // Call the function and get the result.
    let result = calculate.call(
        &mut store,
        &[Value::I32(arg1), Value::I32(arg2), Value::I32(arg3)],
    )?;

    // Get the result. If the result is not of type i32, it returns an error.
    let result_value = match result[0] {
        Value::I32(val) => val,
        _ => return Err(Box::new(RuntimeError::new("Unexpected result type"))),
    };

    // Output the result.
    println!("{} * ({} + {}) = {}", arg1, arg2, arg3, result_value);

    // Exit normally.
    Ok(())
}
```

If you execute `$ cargo 5 3 4`, you will get the following output.

```txt
$ cargo run 5 3 4
    Finished dev [unoptimized + debuginfo] target(s) in 0.12s
     Running `target/debug/rust-wasm 5 3 4`
5 * (3 + 4) = 35
```

As you can see, as long as there is a dedicated runtime, Wasm can be called from any language.

We have learned that Wasm can be called from any OS, CPU, and even any language (if there is a Wasm runtime) as long as there is a Wasm virtual machine.

By reading this far, I think you can understand what "stack-based virtual machine" means.

#### 1.1.3. "Binary Instruction Format"

Next, I will briefly explain the part about "binary format".

Let's take a look at the contents of `calculate.wasm` that js is calling.

Let's display the binary file in hexadecimal using the `xxd` command.

`$ xxd calculate.wasm`

```txt
00000000: 0061 736d 0100 0000 0108 0160 037f 7f7f  .asm.......`....
00000010: 017f 0302 0100 070d 0109 6361 6c63 756c  ..........calcul
00000020: 6174 6500 000a 0c01 0a00 2000 2001 2002  ate....... . . .
00000030: 6a6c 0b   
```

This doesn't tell us much about the contents, so let's use a dedicated command.

Let's read the binary file by executing `$ wasm-objdump -s calculate.wasm`.

```txt
$ wasm-objdump --full-contents calculate.wasm

calculate.wasm: file format wasm 0x1

Contents of section Type:
000000a: 0160 037f 7f7f 017f                      .`......

Contents of section Function:
0000014: 0100                                     ..

Contents of section Export:
0000018: 0109 6361 6c63 756c 6174 6500 00         ..calculate..

Contents of section Code:
0000027: 010a 0020 0020 0120 026a 6c0b            ... . . .jl.
```

It's a bit more readable now.

We will read this output with reference to the [Wasm binary format document](https://webassembly.github.io/spec/core/binary/index.html).

This Wasm binary instruction format is divided into sections: `Type`, `Function`, `Export`, `Code`.

Let's read `Code`'s `010a 0020 0020 0120 026a 6c0b`.

From the [index of instruction bytecodes](https://webassembly.github.io/spec/core/appendix/index-instructions.html) in the document, we were able to decipher the following code.

- `0x20`
  - `local.get`
  - Instruction to push arguments onto the stack
- `0x6a`
  - `i32.add`
  - Instruction to add two i32s
- `0x6c`
  - `i32.mul`
  - Instruction to multiply two i32s
- `0x0b`
  - Instruction to end the function

Let's try reading the binary instruction format again using this.

From `20 00 20 01 20 02`, you can see that it is pushing three arguments (`00`, `01`, `02`) onto the stack.

`6a` is popping two values from the stack and adding them.

`6c` is popping two values from the stack and multiplying them.

`0b` is ending the function.

You can confirm that it has the same content as the wat file we wrote earlier.

We've only touched on the binary, but we've been able to grasp the overview.

Now you should understand what the expression "binary instruction format for a stack-based virtual machine" that represents Wasm means.

### 1.2. More Interesting Wasm

The explanation of Wasm has become a story about the internal structure, but this is the end of the explanation.

Since it can run faster than the limit speed of js, it might be fun to use it as a last resort for front-end performance tuning.

In fact, Wasm is more interesting, and there are deeper stories, such as being able to compile to Wasm from any language, not just compiler languages. Depending on the language implemented, the execution speed may differ for the same process. For example, Wasm generated in Python and Wasm generated in Rust, the Wasm in Rust is overwhelmingly faster.

Also, Wasm, by design, cannot perform processes outside of userland, such as system calls. Since it is running in a sandbox, it can be said that it is safe to use in terms of security.

There is more charm to Wasm, but I will stop here as it will get longer.
