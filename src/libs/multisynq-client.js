// Multisynq Client Library
// This is a simplified wrapper for the Multisynq client

// Import the actual Multisynq client from CDN
const Multisynq = window.Multisynq || {};

// React integration wrapper
export class Model extends (Multisynq.Model || class {}) {
  static register(classId) {
    if (Multisynq.Model && Multisynq.Model.register) {
      Multisynq.Model.register(classId);
      console.log(`Registered model class: ${classId}`);
    } else {
      console.warn('Multisynq.Model not available, registration skipped');
    }
  }
  
  static create(options) {
    if (Multisynq.Model && Multisynq.Model.create) {
      console.log('Creating model with options:', options);
      return Multisynq.Model.create(options);
    } else {
      console.error('Multisynq.Model.create not available');
      throw new Error('Multisynq library not loaded');
    }
  }
}

export class View extends (Multisynq.View || class {}) {
  constructor(model, viewOptions) {
    if (Multisynq.View) {
      console.log('Creating view with model:', model, 'options:', viewOptions);
      super(model, viewOptions);
      
      // Ensure model is accessible
      if (!this.model && model) {
        console.log('View: Setting model from constructor parameter');
        this.model = model;
      }
    } else {
      console.error('Multisynq.View not available');
      throw new Error('Multisynq library not loaded');
    }
  }
}

export function createSession(modelClass, viewClass = null) {
  console.log('Creating session with modelClass:', modelClass, 'viewClass:', viewClass);
  
  return {
    join: async (parameters) => {
      if (Multisynq.Session && Multisynq.Session.join) {
        console.log('Joining session with parameters:', parameters);
        const session = await Multisynq.Session.join({
          ...parameters,
          model: modelClass,
          view: viewClass
        });
        console.log('Session joined successfully:', session);
        
        // Log the session structure to help debug
        console.log('Session object keys:', Object.keys(session));
        if (session.view) {
          console.log('View object keys:', Object.keys(session.view));
        }
        if (session.model) {
          console.log('Model object keys:', Object.keys(session.model));
        }
        
        return session;
      } else {
        console.error('Multisynq.Session.join not available');
        throw new Error('Multisynq library not loaded');
      }
    }
  };
}

// Export the main Multisynq object for direct access
export { Multisynq }; 