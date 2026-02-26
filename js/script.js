const btnAll = document.querySelector('.btn--all');
const btnActive = document.querySelector('.btn--active');
const btnInactive = document.querySelector('.btn--inactive');
const btnToggle = document.querySelector('.btn--toggle');

const extensionsList = document.querySelector('.extensions__list');
const extensionsHeader = document.querySelector('.extensions__header');


let extensions = [];
let filter = 'all';
let theme = 'light';

/*
minutes = how long from now,
use the expiration variable
as the third param with the class instance's set() method!
 */
const minutes = 0.5;
const expiration = minutes * 60 * 1000;
const prefix = 'addOns';


/*
get( key );
set( key, value, expiration);
getAll()
*/
const extensionsStorage = new StorageWrapper( prefix );


const getExtensionTemplate = function( data= {} ){

  const{
    id: extensionId,
    spriteId,
    name,
    description,
    isActive
    } = data;

    const checked = isActive === true? 'checked' : '';

  const template = `
        <article class="extension">
        <div class="extension__data">
          <svg class="extension__icon ${spriteId}">
            <use href="#${spriteId}"></use>
          </svg>
          <div class="extension__texts">
            <h2 class="extension__title">${name}</h2>
            <p class="extension__description">
              ${description}
            </p>
          </div>
        </div>
        <footer class="extension__actions">
          <button class="btn btn--remove" data-extension-id="${extensionId}">Remove</button>
          <label class="extension__switch">
            <input
              type="checkbox"
              data-extension-id="${extensionId}"
              aria-label="Toggle ${name} extension"
              ${checked}
            >
          </label>
        </footer>
      </article>
  `;

  return template;

}

const loadExtensions = async function(){

  const sourceFile = 'data.json';

  try{
    const response = await fetch( sourceFile );
    if( !response.ok ) {
      throw new Error( `HTTP error: ${ response.status }`);
    }

    let id = 1;
    const data = await response.json();

    data.forEach( obj => {
      obj.id =
      String( id++ )
      .padStart(2, '0');

      const { logo } = obj;
      const extensionName =
      logo.match(/.+logo\-(.+?)\.svg/)[1];
      obj.spriteId = `icon-${extensionName}`;
  });

    extensions = data;
    save('extensions', extensions);
    renderExtensions( extensions );

  } catch( error ){

    alert('Failed to load extensions: ', error);
  }
}

const renderExtensions = function( extensions ){

  extensionsList.innerHTML = '';

  extensions.forEach( extension => {

      const extensionHTML = getExtensionTemplate( extension );
      extensionsList.insertAdjacentHTML('beforeend', extensionHTML);
  });
}

/*  event listeners */

/* theme switching */

btnToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');

  save('theme', isDark? 'dark' : '' );
});

/* filtering buttons */

extensionsHeader.addEventListener('click', e => {

const target = e.target;
const isButton = target.classList.contains('btn');

if( !isButton ) return;

  const callBacks = {
    all : showAll,
    active: showActive,
    inactive: showInactive
  };

  const key =
  Object.keys( callBacks )
  .find( key => target.classList
  .contains( `btn--${key}` ));

  callBacks[key]();

});

/* remove buttons & status switches */
extensionsList.addEventListener('click', e => {

    const target = e.target;

    if(target.closest('.btn--remove')){
    const extensionId = target.dataset['extensionId'];
    removeExtension( extensionId );
    }
});

extensionsList.addEventListener('change', e => {

    const target = e.target;
    const isChecked = target.checked;
    const extensionId = target.dataset['extensionId'];

    toggleExtensionStatus(extensionId, isChecked);
});

const toggleExtensionStatus = function( id, status = false ){

  const extension =
  extensions.find( ext => ext.id === id );

  if( !extension ) return;

  extension.isActive = status;
  save('extensions', extensions );
};

const removeExtension = function( id ){

  const extensionIndex =
  extensions.findIndex( ext => ext.id === id );


  if( !Number.isInteger( extensionIndex ) || extensionIndex < 0 ) return;

  extensions.splice( extensionIndex, 1);

  save('extensions', extensions );
  renderExtensions( extensions );
}

const showAll = function( ){
  save( 'filter', 'all');
  save('extensions', extensions);
  showActiveFilter('all');
  renderExtensions( extensions );
};

const showActive = function() {

  const actives =
  extensions
  .filter( extension => extension.isActive === true );

  save( 'filter', 'active');
  save('extensions', extensions);
  showActiveFilter('active');
  renderExtensions( actives );
}

const showInactive = function() {
  const inactives =
  extensions
  .filter( extension => extension.isActive === false );

  save( 'filter', 'inactive');
  save('extensions', extensions);
  showActiveFilter('inactive');
  renderExtensions( inactives );
};

const save = function( name, value ){

    extensionsStorage.set( name, value, expiration );

}


const init = function(){

  const savedExtensions = extensionsStorage.get('extensions');
  const savedTheme = extensionsStorage.get('theme') || '';
  const savedFilter = extensionsStorage.get('filter') || 'all';

  const filteringFunctions = {

      all : showAll,
      active : showActive,
      inactive : showInactive
  };

  if( savedExtensions ){
    extensions = savedExtensions;
    if( savedTheme === '' ) {
      document.body.classList.remove('dark');
    }
    filteringFunctions[ savedFilter ]();
    showActiveFilter( savedFilter );

  }else{
    extensionsStorage.clearNameSpace();
    loadExtensions();
  }

}

let filterButtons = document.querySelectorAll('.btn--all, .btn--active, .btn--inactive');

const showActiveFilter = function( filter ){

  filterButtons.forEach( button => {

      if( button.classList.contains(`btn--${filter}`)){
        button.classList.add('btn--selected');
      }else{
        button.classList.remove('btn--selected');
      }
  });
}

init();






