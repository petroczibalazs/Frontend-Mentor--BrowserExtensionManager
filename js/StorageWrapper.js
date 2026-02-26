class StorageWrapper{


  constructor( prefix = 'default') {
      this.prefix = prefix;
  }

  _key( key ){
    return `${this.prefix}:${key}`;
  }

  set( key, value, ttl = null ){

    const obj = {
      data: value,
      expires : ttl? Date.now() + ttl : null
    }

    localStorage.setItem( this._key( key ), JSON.stringify( obj ));
  }

  get( key ){

    const item = localStorage.getItem( this._key( key ));

    if( !item ) return null;
    let parsed;

    try{
      parsed = JSON.parse( item );
    }
    catch{
      this.remove( key );
      return null;
    }

    if( parsed['expires'] && parsed['expires'] < Date.now()){

      this.remove( key );
      return null;
    }

    return parsed.data;
}

  remove( key ){
    localStorage.removeItem( this._key( key));
  }

  getAll() {

    const results = [];

    for( let i = 0; i < localStorage.length; i++ ){
      const key = localStorage.key( i );
      if( key.startsWith( this.prefix + ':' )){

        const raw = JSON.parse( localStorage.getItem( key ));
        results.push( {
          key: key.replace( this.prefix + ':', ''),
          value: raw.data
        });
      }}

      return results;
  }

  clearNameSpace(){

      const keysToRemove = [];

      for( let i = 0; i < localStorage.length; i++ ){
        const key = localStorage.key( i );
        if( key.startsWith( this.prefix + ':' )) keysToRemove.push( key );
      }

      keysToRemove.forEach( key => localStorage.removeItem( key ));

  }


}