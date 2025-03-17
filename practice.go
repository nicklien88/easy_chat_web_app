package main

import (
	"errors"
	"fmt"
)

func main() {
	// fmt.Println("Hello World")
	// defer fmt.Println("這話會在韓式結束時執行")
	// fmt.Println("主程式運行中")
	// result, error := divide(3, 0)
	// fmt.Println(result)
	// fmt.Println(error)
	ages := make(map[string]int)
	ages["Alice"] = 35
	ages["Bob"] = 30

	fmt.Println("Alice 年齡:", ages["Alice"])
	fmt.Println("Bob 年齡", ages["Bob"])

	delete(ages, "Bob")

	age, exists := ages["Bob"]
	if exists {
		fmt.Println("Bob 年齡", age)
	} else {
		fmt.Println("Bob 不存在")
	}

}

// 變數與常數
func variable() {
	// 變數
	var name string = "Golang"
	age := 10 // 簡寫，不需要 `var` // ?? 可以不用定義型態

	// 常數
	const Pi = 3.14 // ?? 常數不用定義型態

	fmt.Println("Name:", name)
	fmt.Println("Age:", age)
	fmt.Println("Pi:", Pi)

	// 陣列與切片
	arr := [3]int{1, 2, 3}
	slice := []int{1, 2, 3}
	slice = append(slice, 4)

	fmt.Println(arr)
	fmt.Println(slice)
	//	•	陣列 ([N]T) 固定大小。
	// •	切片 ([]T) 是動態數組，推薦使用。
	// //

	if age := 18; age >= 18 {
		fmt.Println("成年")
	} else {
		fmt.Println("未成年")
	}

	for i := 0; i < 5; i++ {
		fmt.Println("i:", i)
	}

	array := []string{"Go", "Python", "Java"}
	for index, value := range array {
		fmt.Println(index, value)
	}

	result := add(5, 3)
	fmt.Println(result)

	x, y := swap(1, 2)
	fmt.Println(x, y)

	p := Person{Name: "John", Age: 25}
	p.Greet()
}

//var 宣告變數，:= 是短變數宣告（只能在函式內部使用）。
//	•	const 宣告常數，值不可變。

// 基本數據類型
var a int = 10       //整數
var b float64 = 3.14 //浮點數
// ?? float32跟float64差在哪
var c bool = true      //布林值
var d string = "Hello" // 字串

func add(a int, b int) int {
	return a + b
}

func swap(a, b int) (int, int) {
	return b, a
}

type Person struct {
	Name string
	Age  int
}

func (p Person) Greet() {
	fmt.Println("Hello, my name is", p.Name)
}

func divide(a, b int) (int, error) {
	if b == 0 {
		return 0, errors.New("除數不能為 0")
	}
	return a / b, nil
}
