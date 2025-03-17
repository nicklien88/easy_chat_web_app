package main

import (
	"fmt"
	"time"
)

func sayHello() {
	fmt.Println("Hello from Goroutine")
}

func main() {
	go sayHello()
	time.Sleep(time.Second)

	ch := make(chan string, 2)
	go worker(ch)
	ch <- "second message"
	ch <- "third message"
	msg := <-ch
	defer fmt.Println("test")
	fmt.Println(msg)
	fmt.Println(<-ch)
	fmt.Println(<-ch)
}

func worker(ch chan string) {
	ch <- "Hello from worker"
}
