 const User = require("../models/User")
const Lists = require("../models/Lists")
const Favorites = require("../models/Favorites")
const axios = require('axios')

 module.exports = {
 getLists: async (req,res) => {

        const lists = await Lists.find({ user: req.user.id }) || []


        res.render('lists.ejs', {lists: lists})
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
        


        res.redirect('/lists/myLists')
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

        res.redirect('/lists/myLists')

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
    
}