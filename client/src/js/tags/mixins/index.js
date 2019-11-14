/**
 * Copyright (c) 2018 Sebastian Altenhuber, Patrick Humme
 *
 * @file Contains riot mixins to be used in view components
 * @author Sebastian Altenhuber <sebastian.altenhuber@gmail.com>
 * @author Patrick Humme <pathumme@gmail.com>
 *
 */

// Initializes dataset on mount and takes care of tag initialization
riot.mixin('getData', {
  init() {
    const tag = this;
    // On tag update
    tag.on('update', () => {
      // If tag does not have a reference to the current dataset yet but
      // the dataset is available in the options object
      if (!tag.dataset && tag.opts.dataset) {
        tag.dataset = tag.opts.dataset;
      }
      // If tag has a reference to the current dataset and the active subview
      // is the subview of the currently active tab
      if (tag.dataset && tag.opts.subview === tag.opts.state.subview) {
        // Initialize tag, if it has not been initialized yet
        if (!tag.initialized) {
          tag.init(tag.dataset, tag.dataset.selection);
          tag.initialized = true;
        } else {
          // If the tag has already been initialized, but receives updates and
          // needs an update, update the chart
          if (tag.needsUpdate && tag.receivesUpdates) {
            tag.updateChart();
            tag.needsUpdate = false;
          }
          // If the tag needs a resize, and is becoming active, call resize method
          if (tag.needsResize && tag.needsResize) {
            tag.resize();
            tag.needsResize = false;
          }
        }
      }
      // On receiving a window resize event
      tag.opts.state.on('window::resize', () => {
        if (tag.initialized) {
          // If tag is currently active, call its' resize method
          if (tag.dataset && tag.opts.subview === tag.opts.state.subview) {
            tag.resize();
          // Otherwise set needsResize variable to true
          } else {
            tag.needsResize = true;
          }
        }
      });
    });

    tag.opts.controller.on('selection::change', () => {
      if (tag.opts.subview !== tag.opts.state.subview && tag.initialized) {
        tag.needsUpdate = true;
      }
    });

    // On color scheme change
    tag.opts.controller.on('colorscheme::changed', () => {
      // If tag is not currently update, set needsUpdate to true
      if (tag.opts.subview !== tag.opts.state.subview && tag.initialized) {
        tag.needsUpdate = true;
      // If tag is currently active, update chart
      } else if (tag.opts.subview === tag.opts.state.subview && tag.initialized) {
        tag.updateChart();
      }
    });

    // Deinitialize events and delete reference to the dataset
    tag.on('unmount', () => {
      tag.opts.controller.selection.off('selection::changed');
      tag.opts.state.off('change::subview');
      tag.dataset = null;
    });
  },
});
riot.mixin('parseState', {
  parseState(settings, styleSettings, key) {
    const tag = this;
    let settingsByUrlParam;
    let styleSettingsByUrlParam;
    if (settings) {
      settingsByUrlParam = tag.getNestedObjectsByKey(settings, key);
    }
    if (styleSettings) {
      styleSettingsByUrlParam = tag.getNestedObjectsByKey(styleSettings, key);
    }
    const state = tag.opts.controller.getState(tag.opts.subview);
    if (state) {
      Object.keys(state).forEach((objKey) => {
        // If there is a style setting with the correspondent key, set it
        const styleSetting = styleSettingsByUrlParam ? styleSettingsByUrlParam[objKey] : undefined;
        const setting = settingsByUrlParam[objKey];
        if (styleSetting) {
          // Special case for colors, which need prepending of # for valid hexcode
          if (styleSetting.type === 'color') {
            styleSetting.value = `#${state[objKey]}`;
          // Special case for booleans, which are converted from 0 and 1
          } else if (styleSetting.type === 'boolean') {
            const isTrue = (state[objKey] === '1');
            styleSetting.value = isTrue;
          // Special case for color scheme key
          } else if (styleSetting.type === 'sequentialColorscheme') {
            styleSetting.key = state[objKey];
          } else {
            styleSetting.value = state[objKey];
          }
        }
        if (setting) {
          if (setting.type === 'boolean') {
            setting.value = (state[objKey] === '1');
          } else if (setting.type === 'select' || setting.type === 'scale') {
            setting.options.forEach((option) => {
              if (option.key === state[objKey]) {
                if (setting.type === 'scale') {
                  setting.selected = option.scale;
                } else {
                  setting.selected = option;
                }
              }
            });
          } else if (setting.type === 'multiselect') {
            const selectedKeys = state[objKey].split(',');
            selectedKeys.forEach((selectedKey) => {
              const attribute = setting.options.find(option => option.key === selectedKey);
              if (attribute) {
                setting.selected.add(attribute);
              }
            });
          } else if (Number.isNaN(state[key])) {
            // If value can be cast to number, cast it
            setting.value = state[objKey];
          } else {
            setting.value = +state[objKey];
          }
        }
      });
    }
  },
  getNestedObjectsByKey(sourceObject, orderKey) {
    const returnObject = {};
    const recursiveFn = function (object, targetKey) {
      Object.keys(object).forEach((key) => {
        // Check if object has key and add it to returnObject, if it has the matching key
        if (object[key]) {
          const value = object[key][targetKey];
          if (value) returnObject[value] = object[key];
          // If the next item is an object, call function again, else return
          if (typeof (object[key]) === 'object') {
            recursiveFn(object[key], targetKey);
          }
        }
      });
    };
    recursiveFn(sourceObject, orderKey);
    return returnObject;
  },
});
// Custom leaflet control panel
riot.mixin('mapSettings', {
  /* eslint-disable no-underscore-dangle,no-undef */
  addMapControlPanel(tag, settings) {
    return L.Control.extend({
      options: {
        position: 'topright',
        collapsed: 'true',
      },
      onAdd() {
        this._initLayout();
        return this._container;
      },
      _onInputClick() {
      },
      _initLayout() {
        // Create HTML element
        const container = L.DomUtil.create('div', 'leaflet-control map-control-styles');
        this._container = container;
        const className = 'map-control-styles';
        const { collapsed } = this.options;

        container.setAttribute('aria-haspopup', true);

        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);

        const form = L.DomUtil.create('form', `${className}-list`);
        this._form = form;

        if (collapsed) {
          this._map.on('click', this.collapse, this);

          if (!L.Browser.android) {
            L.DomEvent.on(container, {
              mouseenter: this.expand,
              mouseleave: (evt) => { if (evt.target.tagName !== 'SELECT') this.collapse(); },
            }, this);
          }
        }

        const link = L.DomUtil.create('a', 'map-control-styles-toggle', container);
        this._link = link;
        if (L.Browser.touch) {
          L.DomEvent.on(link, 'click', L.DomEvent.stop);
          L.DomEvent.on(link, 'click', this.expand, this);
        } else {
          L.DomEvent.on(link, 'focus', this.expand, this);
        }

        const settingsPanel = L.DomUtil.create('map-settings-panel', '', form);
        riot.mount(settingsPanel, 'map-settings-panel', {
          settings,
          container: this,
          state: tag.opts.state,
          controller: tag.opts.controller,
        });

        // work around for Firefox Android issue https://github.com/Leaflet/Leaflet/issues/2033
        L.DomEvent.on(form, 'click', function () {
          setTimeout(L.Util.bind(this._onInputClick, this), 0);
        }, this);

        if (!collapsed) {
          this.expand();
        }

        this._baseLayersList = L.DomUtil.create('div', `${className}-base`, form);
        this._separator = L.DomUtil.create('div', `${className}-separator`, form);
        this._overlaysList = L.DomUtil.create('div', `${className}-overlays`, form);

        container.appendChild(form);
      },
      expand() {
        L.DomUtil.addClass(this._container, 'map-control-styles-expanded');
        this._form.style.height = null;
        const acceptableHeight = this._map.getSize().y - (this._container.offsetTop + 50);
        if (acceptableHeight < this._form.clientHeight) {
          L.DomUtil.addClass(this._form, 'map-control-styles-scrollbar');
          this._form.style.height = `${acceptableHeight}px`;
        } else {
          L.DomUtil.removeClass(this._form, 'map-control-styles-scrollbar');
        }
        return this;
      },
      collapse() {
        L.DomUtil.removeClass(this._container, 'map-control-styles-expanded');
      },
      appendFormElement(formElement) {
        this._form.appendChild(formElement);
      },
    });
  },
  /* eslint-enable no-underscore-dangle,no-undef */
});
riot.mixin('isChildOf', {
  /**
   * Check if HTML element is a child of an other element with id
   * @param {HTMLElement} childElement
   * @param {HTMLElement} parentElement
   * @return {Boolean} - True if childElement is a child of parentElement
   */
  isChildOf(childElement, parentElement) {
    while (childElement) {
      if (childElement === parentElement) return true;
      /* eslint-disable no-param-reassign */
      childElement = childElement.parentElement;
      /* eslint-enable no-param-reassign */
    }
    return false;
  },
});
riot.mixin('debounce', {
  /**
   * Function to 'debounce' inputs, i.e. only emit one call per amount of time
   * @param {Function} func - Function to execute after the specified wait time
   * @param {Number} wait - Time to wait in milliseconds
   */
  debounce(func, wait) {
    let timeout;
    const tag = this;
    return function exec(...argss) {
      tag.searching = true;
      const context = this;
      const args = argss;
      const later = function later() {
        tag.update();
        timeout = null;
        func.apply(context, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
});
riot.mixin('navLinks', {
  navLinks: {
    index: [
      {
        targetView: 'welcome',
        label: 'Welcome',
      },
      {
        targetView: 'browse',
        label: 'Browse Datasets',
      },
      {
        targetView: 'about',
        label: 'About',
      },
    ],
    view: [
      {
        navLabel: 'Overview',
      },
      {
        targetView: 'ms',
        navLabel: 'Map Select',
      },
      {
        targetView: 'mc',
        navLabel: 'Choropleth Map',
      },
      {
        targetView: 'bc',
        navLabel: 'Barchart',
      },
      {
        targetView: 'sp',
        navLabel: 'Scatterplot',
      },
      {
        targetView: 'dt',
        navLabel: 'Data Table',
      },
      {
        targetView: 'bp',
        navLabel: 'Boxplot',
      },
      {
        targetView: 'st',
        navLabel: 'Statistics',
      },
      {
        targetView: 'corr',
        navLabel: 'Correlation Table',
      },
    ],
    admin: [
      {
        targetView: 'add',
        navLabel: 'Add Dataset',
      },
      {
        targetView: 'manage',
        navLabel: 'Manage Datasets',
      },
    ],
  },
});

