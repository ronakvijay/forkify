import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import { elements, renderLoader, clearLoader } from './views/base';

/* Global state of the app
 *- Search Object
 *- Current recipe object
 *- Shopping list object
 *- Liked recipes
*/
const state = {};
window.state = state;

const controlSearch = async () => {
    // 1) get the query from the view
    const query = searchView.getInput();

    if (query) {
        // 2) New search object and add to state
        state.search = new Search(query);

        // 3) Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {

            // 4) Search for recipes
            await state.search.getResults();
            
            // 5) Render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch(ex) {
            console.log(ex);
            
            clearLoader();
            alert('Something went wrong');
        }

    }
}
elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});


elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline')
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    };
})

/* Recipe Controller */
const controlRecipe = async () => {
    //Get the id from the url
    const id = window.location.hash.replace('#', '');
    console.log(id);

    if (id) {

        //prepare the UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // highlight selected search item
        if (state.seacrh) searchView.highlightSelected(id);

        //creating new recipe object
        state.recipe = new Recipe(id);


        try {
            //get recipe data
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();
            //Calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            //Render recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe);

        } catch(ex) {
            console.log(ex);
            
            alert('Error processing recipe!');
        }
    }
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

/* list Controller */
const controlList = () => {
    if (!state.list) state.list = new List();

    //Add each ingredients to list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

//Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;
    //handle delete btn
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        //delete from state 
        state.list.deleteItem();

        //delete from ui
        listView.deleteItem(id);

    //handle the count evt
    } else if (e.target.matches('.shopping__count--value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
})

//handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        //decrease btn is clicked
        if (state.recipe.servings) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        controlList();
    }
});

window.l = new List();

