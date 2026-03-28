
//for filling the ingredient input with the ingredient that was clicked on in the ingredient list on the home page and search results page
//document.querySelectorAll('.ingButtons').forEach(button => {
//    button.addEventListener('click', (e) => {
//        e.preventDefault();
//
//        const selectedIngredient = button.innerText;
//        console.log(selectedIngredient);
//
//        const input = document.getElementById('ingredientInput');
//
//        // Replace whatever is in the input
//        input.value = selectedIngredient;
//    });
//});

//mobilenav toggle
const mobileNavBtn = document.querySelector('.menu-btn');
const mobilenav = document.querySelector('#mobilenav-ct');
const mobileNav2 = document.getElementById('mobilenav');
const mobileNavLinks = document.querySelectorAll('#mobilenav-ct li');


mobileNavBtn.addEventListener('click', toggleMobileNav);

function toggleMobileNav() {
  console.log("Toggling mobile nav");
    mobilenav.classList.toggle('hidden');
    mobileNav2.classList.toggle('hidden');
    mobileNavLinks.forEach(link => link.classList.toggle('hidden'));
}

//for toggling the ingredient list on and off on the home page and search results page
const toggleBtn = document.getElementById('toggleIngredients');
const ingredientBox = document.querySelector('.ingredientBoxes');

if (toggleBtn && ingredientBox) {
    toggleBtn.addEventListener('click', () => {
        ingredientBox.classList.toggle('active');

        toggleBtn.textContent = ingredientBox.classList.contains('active')
            ? 'Hide Ingredients'
            : 'Show Ingredients';
    });
}


//FOR FAVORITES - NOT IN USE YET
//document.querySelectorAll('.favorite-btn').forEach(button => {
//    button.addEventListener('click', async (e) => {
//        e.preventDefault();
//
//        const drinkId = button.dataset.drinkId;
//        console.log("Clicked favorite button for drink ID:", drinkId);
//
//        try {
//            const response = await fetch(`/favorites/${drinkId}?_method=PUT`, {
//                method: 'POST',
//                headers: {
//                    'Content-Type': 'application/json'
//                }
//            });
//
//            if (response.ok) {
//                console.log("Successfully added to favorites");
//                // Optionally, update the UI to reflect the change
//            } else {
//                console.error("Failed to add to favorites");
//            }
//        } catch (error) {
//            console.error("Error adding to favorites:", error);
//        }
//    });
//});       

//OPTIMISTIC UI UPDATE FOR FAVORITES
document.querySelectorAll('.favorite-btn').forEach(button => {
  button.addEventListener('click', async () => {
    const drinkId = button.dataset.drinkId

    // 🔥 OPTIMISTIC UI UPDATE (instant)
    button.classList.toggle('active')

    const icon = button.querySelector('i')
    icon.classList.toggle('fa-martini-glass-empty')
    icon.classList.toggle('fa-martini-glass')

    try {
      const res = await fetch(`/favorites/${drinkId}`, {
        method: 'PUT'
      })

      const data = await res.json()

      // ✅ OPTIONAL: sync with backend truth
      if (data.status === 'removed') {
        button.classList.remove('active')
        icon.classList.remove('fa-martini-glass')
        icon.classList.add('fa-martini-glass-empty')
      } else {
        button.classList.add('active')
        icon.classList.add('fa-martini-glass')
        icon.classList.remove('fa-martini-glass-empty')
      }

    } catch (err) {
      console.error(err)

      // ❌ rollback if request fails
      button.classList.toggle('active')
      icon.classList.toggle('fa-martini-glass')
      icon.classList.toggle('fa-martini-glass-empty')
    }
  })
})


///Toggle the display of the custom list form on the myLists page
document.querySelectorAll('.list-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();

    const card = e.target.closest('.cocktailBox');
    const rightPanel = card.querySelector('.inDivRight');

    rightPanel.classList.toggle('show-list');
  });
});

//OPTIMISTIC UI UPDATE FOR ADDING/REMOVING DRINKS FROM CUSTOM LISTS
document.querySelectorAll('.drinkList-btn').forEach(button => {
  button.addEventListener('click', async () => {
    const drinkId = button.dataset.drinkId
    const listId = button.dataset.listId

    // 🔥 OPTIMISTIC UPDATE
    button.classList.toggle('in-list')

    try {
      const res = await fetch(`/myLists/${listId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ drinkId })
      })

      const data = await res.json()

      // ✅ Sync with backend truth
      if (data.status === 'removed') {
        button.classList.remove('in-list')
      } else {
        button.classList.add('in-list')
      }

    } catch (err) {
      console.error(err)

      // ❌ rollback on failure
      button.classList.toggle('in-list')
    }
  })
})