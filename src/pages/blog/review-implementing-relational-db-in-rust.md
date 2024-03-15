---
title: 'Achievements, Reflections, and Learnings from Building a Relational Database in Rust'
date: 2024-03-03
tags: ['rust', 'dbms']
---

# Introduction

In this article, I share my experience of developing a relational database as a personal project in the Rust language, including the achievements, reflections, and Learnings.

# Why I Built My Own DBMS

The reason I embarked on creating my own DBMS was to gain a deeper understanding of the content in the book "[Designing Data-Intensive Applications](https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/)."

![](https://learning.oreilly.com/library/cover/9781491903063/250w/)

This book is a masterpiece that carefully explains the methodologies to ensure the most important aspects of designing and operating data systems: "reliability," "scalability," and "maintainability," by skillfully bridging theory and practice while citing a wealth of literature. If you haven't read it, go buy it immediately. It's really a good book.

Since the book also contains a wealth of information on the internal structure of databases, it made me feel like, "Maybe I should try making a database myself..."

# Reasons for Choosing Rust

While implementing the database, I also wanted to become more familiar with Rust, so I adopted it as the implementation language.

It may seem a bit too straightforward, and I apologize for that, but that's the truth.

# Databases Used for Reference

Commercial databases like PostgreSQL and MySQL typically consist of tens of millions of lines of code. Realistically, it's impossible to study the implementation by reading the source code of these databases, so it was necessary to use an educational database as a teaching material.

For the educational database to reference, there were candidates such as [bustub](https://github.com/cmu-db/bustub) used in CMU's database lectures and [SimpleDB](http://cs.bc.edu/~sciore/simpledb/), which is explained in the textbook [Database Design and Implementation](https://link.springer.com/book/10.1007/978-3-030-33836-7).

I decided to refer to SimpleDB because having a textbook seemed to match my level and learning method better.

# The Database I Implemented

I implemented a database called [OxideDB](https://github.com/ie-Yoshisaur/OxideDB/tree/main).

The naming went like this: "Rust is rust" → "Rust is an oxide of iron", hence the name OxideDB.

I'm quite fond of the naming itself, but including DB in the name seems to be a common naming anti-pattern that is prone to duplication. Next time, I plan to adopt a method called "[The Pavlo Database Naming Method](https://www.cs.cmu.edu/~pavlo/blog/2020/03/on-naming-a-database-management-system.html)," which involves connecting two unrelated monosyllabic words.

The implementation and testing combined resulted in a software of about 14,000 lines.

CRUD operations can also be performed with basic SQL, and indexes can be created.

I am proud of myself for being able to implement this.

![](/images/review-implementing-relational-db-in-rust/demo.png)

# Achievements

## I grasped the tricks of software development

I like the phrase "*Software development is a series of abstractions*," and I've come to understand the meaning of this phrase through my own experience.

In the early stages, I couldn't write a single line of code without having all the details of the code I needed to implement in my head,
but as development progressed, once I abstracted and interfaced the processes appropriately, I could write code without any problems, even if I forgot the specific details of the implementation at that moment.

The human brain follows a process of abstraction after forgetting, but I realized that by reversing this process in software development, I could make it more efficient, which I feel is a significant achievement for me.

## I understood transactions

I've come to understand the mechanism of transactions, which are used to maintain data consistency in databases, through implementation.
This experience has allowed me to understand concepts that are frequently mentioned in documentation but are intuitively difficult to grasp, such as "latches," "locks," "WAL," and "transaction isolation levels," on an implementation basis.

## I built confidence

Creating a DB is as labor-intensive as creating a compiler or an OS, so being able to do that level of work as an undergraduate has given me confidence.

Even slightly difficult engineering tasks have become less daunting with the thought, "Well, I've made a database before."

# Reflections

## Database implementation became just a code translation task midway

While I implemented the database in Rust with reference to the SimpleDB source code, the implementation work became a mere code translation task midway through.

From a certain point, I was just mechanically converting Java code into Rust without deeply considering the meaning of the implementation in the source code.

While it's inevitable to some extent to be forced into code transcription or translation work for learning when you have no knowledge of database implementation, I should have made sure not to lose sight of the learning objectives.

## The granularity of latches is coarse

Although I was able to implement the database functionality, the performance is desperately lacking.
Specifically, components such as `FileManager`, which reads and writes byte sequences to disk within the database, and `BufferManager`, which reads and writes data on the heap to replace slow disk I/O with memory I/O, as well as all other components, are wrapped in `Arc<Mutex<>>`, which has affected the parallelization of data reading and writing.

```Rust
pub struct OxideDB {
    block_size: usize,
    file_manager: Arc<Mutex<FileManager>>,
    log_manager: Arc<Mutex<LogManager>>,
    buffer_manager: Arc<Mutex<BufferManager>>,
    lock_table: Arc<Mutex<LockTable>>,
    metadata_manager: Option<Arc<MetadataManager>>,
    planner: Option<Arc<Mutex<Planner>>>,
}
```

This is due to the fact that I converted the architecture optimized for Java to Rust without thinking too deeply about it. `LogManager` and `BufferManager` perform disk access, so they are designed to perform dependency injection (DI) by passing a `FileManager` instance that performs disk access to the constructor. Other instances are designed in the same way, to perform a matryoshka of DI.

DI lowers the coupling between classes/structures, making the code easier to change and test, but this design pattern conflicts with Rust's language rules that state, "If multiple instances are shared, use `Arc<>`, and if there is a possibility that the instance will be modified, it must be wrapped in `Arc<Mutex<>>`."

In this implementation, I faithfully reproduced the original design of SimpleDB in Rust without considering the optimal software design patterns for Java, which relies on GC for memory management, and Rust, which strictly manages the scope of ownership for memory management. As a result, I ended up with a database with coarse-grained latches.

Next time, I will design the database according to Rust's language rules.

# Lessons Learned from Database Development and Advice from Predecessors

I am a member of a certain database DIY community, and I would like to share the lessons I learned from the advice I received there.

## Coarseness of Latch Granularity is Room for Growth

When I lamented about the coarseness of latch granularity in the community, I was comforted with the words, "The coarseness of latch granularity is room for growth."

When you all try your hand at creating your own DB, don't be intimidated by the granularity of locks and implement them boldly.

## Software Design and Implementation are Refined Through Repeated Trials

"*What you made this time served its purpose for understanding and you gained experience, so let's throw it away somewhere with gratitude*" (I made some changes to the original text)

Considering the effort involved in implementing a database, this is quite shocking advice, but it turned out to be beneficial.

Design is originally meant to minimize uncertainty in subsequent implementations, but in the actual development process, things rarely go as planned in the design stage. Furthermore, it is not uncommon to find problems with the design itself during the implementation stage.

In such cases, if it is determined that changes exceeding the plasticity limits of the software are necessary, starting over from scratch is also an option.

If it weren't for this advice, I would have wasted time on additional features for this OxideDB that are almost worthless.

According to the person who gave me this advice, it takes about three rounds to get to a good design.

I will work hard for two more rounds!

*Note: This is insight for aiming for simply better software. In business, there is an incentive to avoid wasting the man-hours already used, so this way of thinking is in a trade-off relationship.

# Future Prospects

## Study Concurrency

In this development, I believe that my lack of knowledge in concurrent processing was the cause of the incorrect implementation, so I want to learn more about it.

The textbook I plan to read is "[Introduction to Concurrent Programming - An Approach from Implementations in Rust, C++, and Assembly](https://www.oreilly.co.jp//books/9784873119595/)." (This is a Japanese book)

## Anyway, Round 2

I want to take on Round 2.
I have a rough idea of a design that would suit Rust, so I want to proceed with it while studying concurrent programming.

## Create educational material as OSS

I want to increase the number of people who can build their own databases, so I'm thinking of creating hands-on educational material that is accessible to beginners in the very distant future.

I'm imagining something similar to [rustlings](https://github.com/rust-lang/rustlings).

# The End

Thank you for reading until the end. I will continue to work on database creation at my own pace, so I appreciate your support.
