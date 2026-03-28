const User = require("../models/User")
const Lists = require("../models/Lists")
const Favorites = require("../models/Favorites")
const axios = require('axios')


module.exports = {
    getIndex: (req,res)=>{
        res.render('index.ejs')
    },

    getHome: async (req,res) => {

        ///CREATE TWO ARRAYS TO SPLIT INGREDIENTS INTO TWO COLUMNS
            const ingredientsOne = [];
            const ingredientsTwo = [];


        try{
        //IngredientList
        const response = await axios.get(
        'https://www.thecocktaildb.com/api/json/v1/1/list.php?i=list'
      )

        const rawIngredients = response.data.drinks || []
        
        const ingredients = [];
        rawIngredients.forEach(item => {   
        ingredients.push(item.strIngredient1);
        })

        //console.log(ingredients)

       
        for (let i = 0; i < ingredients.length; i++) {
            if (i < ingredients.length / 2) {
                ingredientsOne.push(ingredients[i]);
            } else {
                ingredientsTwo.push(ingredients[i]);
            }
        }

        console.log(ingredientsOne.length, ingredientsTwo.length)

       

        }catch(err){
            console.error(err)
        }



        res.render('home.ejs', { ingredientsOne, ingredientsTwo})
    },
    getLetterSearch: async (req,res) => {

         ///CREATE TWO ARRAYS TO SPLIT INGREDIENTS INTO TWO COLUMNS
            const ingredientsOne = [];
            const ingredientsTwo = [];

        try {

            //GET INGREDIENT LIST FOR SIDEBAR same as home controller

             //IngredientList
        const ingredientResponse = await axios.get(
        'https://www.thecocktaildb.com/api/json/v1/1/list.php?i=list'
      )

        const rawIngredients = ingredientResponse.data.drinks || []
        
        const ingredients = [];
        rawIngredients.forEach(item => {   
        ingredients.push(item.strIngredient1);
        })

        //console.log(ingredients)

       
        for (let i = 0; i < ingredients.length; i++) {
            if (i < ingredients.length / 2) {
                ingredientsOne.push(ingredients[i]);
            } else {
                ingredientsTwo.push(ingredients[i]);
            }
        }

        console.log(ingredientsOne.length, ingredientsTwo.length)

       

      const letter = req.params.letter

      const response = await axios.get(
        `https://www.thecocktaildb.com/api/json/v1/1/search.php?f=${letter}`
      )

       const rawDrinks = response.data.drinks || []

      const drinks = rawDrinks.map(drink => {

        // INGREDIENTS
        let ingredientList = []
        const keys = Object.keys(drink)

        const ingredientKeys = keys.filter(key =>
          key.includes("strIngredient")
        )

        ingredientKeys.forEach(key => {
          const value = drink[key]
          if (value) ingredientList.push(value)
        })


        // MEASUREMENTS
        let measurementList = []

        const measurementKeys = keys.filter(key =>
          key.includes("strMeasure")
        )

        measurementKeys.forEach(key => {
          const value = drink[key]
          if (value) measurementList.push(value)
        })


        // COMBINED INGREDIENT + MEASUREMENT
        const ingredients = ingredientList.map((ingredient, i) => ({
          ingredient,
          measurement: measurementList[i] || ''
        }))


        return {
          idDrink: drink.idDrink,
          name: drink.strDrink,
          image: drink.strDrinkThumb,
          alcoholic: drink.strAlcoholic,
          glass: drink.strGlass,
          instructions: drink.strInstructions,
          ingredients,
          favorited: false // Placeholder for favorite status, to be updated later
        }

      })

      //LOGIC TO CHECK FAVORITES - AND ADD FAVORITE STATUS TO EACH DRINK OBJECT --- IGNORE FOR NOW ---

      //check existing ids on page
      //check user's favorites list
      //add boolean to each drink - favorited: true/false 
      

        const favorites = await Favorites.findOne({ user: req.user.id })

        // fallback to empty array if none
        const favoriteIds = favorites?.drinkIds || []

        // convert to Set for O(1) lookup
        const favoriteSet = new Set(favoriteIds)

        // map over drinks and add favorited flag
        const drinksWithFavorites = drinks.map(drink => {
          return {
            ...drink,
            favorited: favoriteSet.has(drink.idDrink)
          }
        })

        //console.log(drinks)


        
        //Load names of lists
        const drinkLists = await Lists.find({ user: req.user.id }).lean()

        const drinkListsWithFlags = drinkLists.map(list => ({
          ...list,
          drinkSet: new Set(list.drinkIds) // faster lookup
        }))


      res.render('searches.ejs', { 
        drinks: drinksWithFavorites, 
        ingredientsOne: ingredientsOne || [], 
        ingredientsTwo: ingredientsTwo || [], 
        drinkLists: drinkListsWithFlags || []
    })
    } catch (err) {
  console.error(err)
  res.render('searches.ejs', { 
    drinks: [],
    ingredientsOne: [],
    ingredientsTwo: [],
    drinkLists: []
  })
}

  

    },

    redirectIngredient: (req, res) => {

    const inputValue = req.query.ingredient

    const formatStr = inputValue
    .split(" ")
    .map(word => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")

    res.redirect(`/ingredient/${formatStr}`)
    },

    /////Ingredient search, two step fetch first to get drink IDs, second to get drink details in parallel, then transform data same as letter controller
    getIngredientSearch: async (req,res) => {

         ///CREATE TWO ARRAYS TO SPLIT INGREDIENTS INTO TWO COLUMNS
            const ingredientsOne = [];
            const ingredientsTwo = [];

        try {

            //GET INGREDIENT LIST FOR SIDEBAR same as home controller

              //GET INGREDIENT LIST FOR SIDEBAR same as home controller

             //IngredientList
        const ingredientResponse = await axios.get(
        'https://www.thecocktaildb.com/api/json/v1/1/list.php?i=list'
      )

        const rawIngredients = ingredientResponse.data.drinks || []
        
        const ingredients = [];
        rawIngredients.forEach(item => {   
        ingredients.push(item.strIngredient1);
        })

        //console.log(ingredients)

       
        for (let i = 0; i < ingredients.length; i++) {
            if (i < ingredients.length / 2) {
                ingredientsOne.push(ingredients[i]);
            } else {
                ingredientsTwo.push(ingredients[i]);
            }
        }

        //console.log(ingredientsOne.length, ingredientsTwo.length)

        // END SIDEBAR INGREDIENT FETCH

      const inputValue = req.params.ingredient
            //console.log("Raw input:", inputValue)

      // format input (same as your frontend)
      const formatStr = inputValue
        .split(" ")
        .map(word => word[0].toUpperCase() + word.slice(1).toLowerCase())
        .join(" ")


      // FIRST FETCH (ingredient filter)
      const filterResponse = await axios.get(
        `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${formatStr}`
      )

      const drinkIdArr = (filterResponse.data.drinks || []).map(d => d.idDrink)

      

      // SECOND FETCH (parallel lookup)
      const requests = drinkIdArr.map(id =>
        axios
          .get(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`)
          .then(res => res.data.drinks?.[0])
          .catch(err => {
            console.error(`Error fetching ${id}`, err)
            return null
          })
      )

      const rawDrinks = (await Promise.all(requests)).filter(Boolean)


      // SAME TRANSFORMATION AS LETTER CONTROLLER
      const drinks = rawDrinks.map(drink => {

        const keys = Object.keys(drink)

        // INGREDIENTS
        let ingredientList = []

        const ingredientKeys = keys.filter(key =>
          key.includes("strIngredient")
        )

        ingredientKeys.forEach(key => {
          const value = drink[key]
          if (value) ingredientList.push(value)
        })


        // MEASUREMENTS
        let measurementList = []

        const measurementKeys = keys.filter(key =>
          key.includes("strMeasure")
        )

        measurementKeys.forEach(key => {
          const value = drink[key]
          if (value) measurementList.push(value)
        })


        // COMBINE
        const ingredients = ingredientList.map((ingredient, i) => ({
          ingredient,
          measurement: measurementList[i] || ''
        }))

        


        return {
          idDrink: drink.idDrink,
          name: drink.strDrink,
          image: drink.strDrinkThumb,
          alcoholic: drink.strAlcoholic,
          glass: drink.strGlass,
          instructions: drink.strInstructions,
          ingredients
        }

      })

       //LOGIC TO CHECK FAVORITES - AND ADD FAVORITE STATUS TO EACH DRINK OBJECT --- IGNORE FOR NOW ---

      //check existing ids on page
      //check user's favorites list
      //add boolean to each drink - favorited: true/false 
      

        const favorites = await Favorites.findOne({ user: req.user.id })

        // fallback to empty array if none
        const favoriteIds = favorites?.drinkIds || []

        // convert to Set for O(1) lookup
        const favoriteSet = new Set(favoriteIds)

        // map over drinks and add favorited flag
        const drinksWithFavorites = drinks.map(drink => {
          return {
            ...drink,
            favorited: favoriteSet.has(drink.idDrink)
          }
        })

        //console.log(drinks)


        //Load names of lists
        const drinkLists = await Lists.find({ user: req.user.id }).lean()

        const drinkListsWithFlags = drinkLists.map(list => ({
          ...list,
          drinkSet: new Set(list.drinkIds) // faster lookup
        }))


      res.render('searches.ejs', { 
        drinks: drinksWithFavorites, 
        ingredientsOne: ingredientsOne || [], 
        ingredientsTwo: ingredientsTwo || [] , 
        drinkLists: drinkListsWithFlags || []
    })

    } catch (err) {
  console.error(err)
  res.render('searches.ejs', { 
    drinks: [],
    ingredientsOne: [],
    ingredientsTwo: [],
    drinkLists: []
  })
}


    },

     putFavorites: async (req,res) =>{

    const favDrinkId = req.params.id
    const userId = req.user.id

    try {

        // create favorites document if it doesn't exist
        const favDrinkId = req.params.id
        const userId = req.user.id


        let favorites = await Favorites.findOne({ user: userId })
        console.log("Current favorites document:", favorites)

        if (!favorites) {
            favorites = new Favorites(
                { user: userId, drinkIds: [favDrinkId] })
            await favorites.save()
            //console.log("Created new favorites document:", favorites)
        }

        if (favorites.drinkIds.includes(favDrinkId)) {

            await Favorites.findOneAndUpdate(
                { user: userId },
                { $pull: { drinkIds: favDrinkId } },
                { new: true }
            )

            return res.json({
                status: "removed",
                message: `Drink ${favDrinkId} removed from favorites`
            })

        } else {

            await Favorites.findOneAndUpdate(
                { user: userId },
                { $push: { drinkIds: favDrinkId } },
                { new: true }
            ) 

   
   
        res.json({
            status: "success",
            message: `Drink ${favDrinkId} added to favorites`
        })

    }

    } catch (err) {

        console.error(err)
        res.status(500).json({
            status: "error",
            message: err.message
        })  
    }

    },
     postLists: async (req,res) => {

        try {

            const formatStr = req.body.listName
            .split(" ")
            .map(word => word[0].toUpperCase() + word.slice(1).toLowerCase())
            .join(" ")
            
           const newList = new Lists({
                user: req.user.id,
                name: formatStr,
                drinkIds: []
            })

            await newList.save()

        } catch (err) {
            console.error(err)
        }
        


        res.redirect('/myLists')
    },




    
    getLists: async (req,res) => {

        const lists = await Lists.find({ user: req.user.id }) || []


        res.render('lists.ejs', {lists: lists})
    },

    getCustomList: async (req,res) => {

        const listId = req.params.id
        let drinks = [];

        try {

      const list = await Lists.findOne({ _id: listId, user: req.user.id } ) || null
            
        

        if (!list) {
            return  res.render('customList.ejs', {list: [], drinks: []})
            }
        else if (list.drinkIds.length === 0) {
            return res.render('customList.ejs', {list: [], drinks: []})
        }else{
            const requests = list.drinkIds.map(id =>
                axios
                  .get(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`)
                  .then(res => res.data.drinks?.[0])
                  .catch(err => {
                    console.error(`Error fetching ${id}`, err)
                    return null
                  })
              )

              const rawDrinks = (await Promise.all(requests)).filter(Boolean)
              //console.log("RAW DRINKS FROM FAVORITES:", rawDrinks)


               drinks = rawDrinks.map(drink => {

                const keys = Object.keys(drink)

                // INGREDIENTS
                let ingredientList = []

                const ingredientKeys = keys.filter(key =>
                  key.includes("strIngredient")
                )

                ingredientKeys.forEach(key => {
                  const value = drink[key]
                  if (value) ingredientList.push(value)
                })    
                // MEASUREMENTS
                let measurementList = []

                const measurementKeys = keys.filter(key =>
                  key.includes("strMeasure")
                )

                measurementKeys.forEach(key => {
                  const value = drink[key]
                  if (value) measurementList.push(value)
                })  

                 // COMBINE
                const ingredients = ingredientList.map((ingredient, i) => ({
                  ingredient,
                  measurement: measurementList[i] || ''
                }))

                console.log(drinks)
            
                return {
                    idDrink: drink.idDrink,
                    name: drink.strDrink,
                    image: drink.strDrinkThumb,
                    alcoholic: drink.strAlcoholic,
                    glass: drink.strGlass,
                    instructions: drink.strInstructions,
                    ingredients,
                
                }
            }   //end of drinks map    
        
        
            )}//end of conditional
        
        
             //LOGIC TO CHECK FAVORITES - AND ADD FAVORITE STATUS TO EACH DRINK OBJECT
        
              //check existing ids on page
              //check user's favorites list
              //add boolean to each drink - favorited: true/false 

        
                const favorites = await Favorites.findOne({ user: req.user.id })
        
                // fallback to empty array if none
                const favoriteIds = favorites?.drinkIds || []
        
                // convert to Set for O(1) lookup
                const favoriteSet = new Set(favoriteIds)
        
                // map over drinks and add favorited flag
                const drinksWithFavorites = drinks.map(drink => {
                  return {
                    ...drink,
                    favorited: favoriteSet.has(drink.idDrink)
                  }
                })

            

            //Load names of lists
            const drinkLists = await Lists.find({ user: req.user.id }).lean()

            const drinkListsWithFlags = drinkLists.map(list => ({
              ...list,
              drinkSet: new Set(list.drinkIds) // faster lookup
            }))



            res.render('customList.ejs', {
                list: list, 
                drinks: drinksWithFavorites, 
                //ingredientsOne: ingredientsOne || [], 
                //ingredientsTwo: ingredientsTwo || [] , 
                drinkLists: drinkListsWithFlags || []
            })

        } catch (err) {
            console.error(err)
            res.redirect('/myLists')
        }
    },

    putLists: async (req, res) => {
  const listId = req.params.id
  const drinkId = req.body.drinkId
  const userId = req.user.id

  try {
    const list = await Lists.findOne({ _id: listId, user: userId })

    if (!list) {
      return res.status(404).json({
        status: "error",
        message: "List not found"
      })
    }

    if (list.drinkIds.includes(drinkId)) {
      await Lists.findOneAndUpdate(
        { _id: listId, user: userId },
        { $pull: { drinkIds: drinkId } }
      )

      return res.json({
        status: "removed",
        listId,
        drinkId
      })
    } else {
      await Lists.findOneAndUpdate(
        { _id: listId, user: userId },
        { $push: { drinkIds: drinkId } }
      )

      return res.json({
        status: "added",
        listId,
        drinkId
      })
    }

  } catch (err) {
    console.error(err)
    res.status(500).json({
      status: "error",
      message: err.message
    })
  }
},

    deleteLists: async (req,res) =>{

        const listId = req.params.id

        try {
            await Lists.findByIdAndDelete(listId)
        } catch (err) {
            console.error(err)
        }   

        res.redirect('/myLists')

    },

    getFavorites: async (req,res) =>{
        let drinks = [];
        try{
            
       
        const favesIdArr = await Favorites.findOne({ user: req.user.id })
        console.log("FAVORITES DOCUMENT:", favesIdArr)
        

        if (!favesIdArr) {
            return  res.render('favorites.ejs', {drinks: []})
            }
        else if (favesIdArr.drinkIds.length === 0) {
            return res.render('favorites.ejs', {drinks: []})
        }else{
            const requests = favesIdArr.drinkIds.map(id =>
                axios
                  .get(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`)
                  .then(res => res.data.drinks?.[0])
                  .catch(err => {
                    console.error(`Error fetching ${id}`, err)
                    return null
                  })
              )

              const rawDrinks = (await Promise.all(requests)).filter(Boolean)
              //console.log("RAW DRINKS FROM FAVORITES:", rawDrinks)


               drinks = rawDrinks.map(drink => {

                const keys = Object.keys(drink)

                // INGREDIENTS
                let ingredientList = []

                const ingredientKeys = keys.filter(key =>
                  key.includes("strIngredient")
                )

                ingredientKeys.forEach(key => {
                  const value = drink[key]
                  if (value) ingredientList.push(value)
                })    
                // MEASUREMENTS
                let measurementList = []

                const measurementKeys = keys.filter(key =>
                  key.includes("strMeasure")
                )

                measurementKeys.forEach(key => {
                  const value = drink[key]
                  if (value) measurementList.push(value)
                })  

                 // COMBINE
                const ingredients = ingredientList.map((ingredient, i) => ({
                  ingredient,
                  measurement: measurementList[i] || ''
                }))

                console.log(drinks)
            
                return {
                    idDrink: drink.idDrink,
                    name: drink.strDrink,
                    image: drink.strDrinkThumb,
                    alcoholic: drink.strAlcoholic,
                    glass: drink.strGlass,
                    instructions: drink.strInstructions,
                    ingredients,
                
                }
            }   //end of drinks map    
        
        
            )}//end of conditional
        
        
             //LOGIC TO CHECK FAVORITES - AND ADD FAVORITE STATUS TO EACH DRINK OBJECT
        
              //check existing ids on page
              //check user's favorites list
              //add boolean to each drink - favorited: true/false 

        
                const favorites = await Favorites.findOne({ user: req.user.id })
        
                // fallback to empty array if none
                const favoriteIds = favorites?.drinkIds || []
        
                // convert to Set for O(1) lookup
                const favoriteSet = new Set(favoriteIds)
        
                // map over drinks and add favorited flag
                const drinksWithFavorites = drinks.map(drink => {
                  return {
                    ...drink,
                    favorited: favoriteSet.has(drink.idDrink)
                  }
                })

                //Load names of lists
                const drinkLists = await Lists.find({ user: req.user.id }).lean()

                const drinkListsWithFlags = drinkLists.map(list => ({
                  ...list,
                  drinkSet: new Set(list.drinkIds) // faster lookup
                }))

           




            
                res.render('favorites.ejs', {drinks: drinksWithFavorites || [], drinkLists: drinkListsWithFlags || []})
          

            }catch(err){
                console.error(err)
                res.render('favorites.ejs', {drinks: []})
            }


               },
    

   

    deleteFavorites: async (req,res) =>{

        res.render('favorites.ejs', {})

    }   
}