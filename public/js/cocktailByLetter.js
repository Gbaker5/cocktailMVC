
const ingredients = document.querySelectorAll('.ingOptions')


Array.from(ingredients).forEach(ingredient => {
    ingredient.addEventListener('click', () => {
        ingInput

    })
});


function ingInput(ingredient) {
    console.log(ingredient.innerHTML)
}   

