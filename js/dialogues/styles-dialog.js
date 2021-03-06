const template = `
    <v-dialog
      v-model="dialog"
      width="700"
      persistent
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
            small
            id="copy-styles"
            v-bind="attrs"
            v-on="on"
            class="mt-2"
        >
        <slot name="buttonlabel"></slot>
        </v-btn>
      </template>

      <v-card>
        <v-card-title
          class="headline grey lighten-2"
          primary-title
        >
        Apply styles
        </v-card-title>

        <v-row class="ma-1">
        <v-col cols="6">
            <v-card class="mx-auto">
                <v-toolbar color="gray" dark>
                    <v-toolbar-title>Applicable Entities</v-toolbar-title>
                </v-toolbar>
                <v-list
                color="grey lighten-1"
                dense
                height="200"
                class="overflow-y-auto py-0"
                >
                    <v-list-item-group multiple v-model="selectedEntities" color="primary">
                        <template v-for="(entity, index) in applicableEntities">
                            <v-list-item>
                                <template v-slot:default="{ active, toggle }">
                                    <v-list-item-action>
                                    <v-checkbox color="primary" @click="toggle" v-model="active"></v-checkbox>
                                    </v-list-item-action>
                                    <v-list-item-content>
                                    <v-list-item-title v-text="entity.name"></v-list-item-title>
                                    </v-list-item-content>
                                </template>
                            </v-list-item>
                        </template>
                    </v-list-item-group>
                </v-list>
            </v-card>
        </v-col>
        <v-col cols="6">
            <v-card class="mx-auto">
                <v-toolbar color="gray" dark>
                    <v-toolbar-title>Properties</v-toolbar-title>
                </v-toolbar>
                <v-list
                color="grey lighten-1"
                dense
                height="200"
                class="overflow-y-auto py-0"
                >
                    <v-list-item-group multiple v-model="selectedProperties" color="primary">
                        <template v-for="(value, property) in changes">
                            <v-list-item>
                            <template v-slot:default="{ active, toggle }">
                                <v-list-item-action>
                                <v-checkbox color="primary" @click="toggle" v-model="active"></v-checkbox>
                                </v-list-item-action>
                                <v-list-item-content>
                                    <v-list-item-title v-text="property"></v-list-item-title>
                                    <v-list-item-title v-text="value"></v-list-item-title>
                                </v-list-item-content>
                                </template>
                            </v-list-item>
                        </template>
                    </v-list-item-group>
                </v-list>
            </v-card>
    </v-col>
      </v-row>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="submit">Submit</v-btn>
          <v-btn @click="cancel">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
`;

export function applyProperties(src, dst, properties) {
    const source = src.clone();

    properties.forEach(p => {
        dst[p] = source[p];
    });
}

Vue.component('styles-dialog-container', {
    template: template,
    props: ['entity', 'entities', 'changes'],
    data: function() {
        return {
            dialog: false,
            featureType: null,
            selectedEntities: [],
            selectedProperties: []
        };
    },
    watch: {
        dialog: function(active) {
            if (active) {
                this.featureType = null;
                if (this.entity.billboard) {
                    this.featureType = 'billboard';
                }
                else if (this.entity.polygon) {
                    this.featureType = 'polygon';
                }
                this.selectedEntities = this.applicableEntities.map((_, i) => i);
                this.selectedProperties = Object.keys(this.changes).map((_, i) => i);
            }
        }
    },
    computed: {
        applicableEntities() {
            return this.entities.filter(e => e[this.featureType]);
        }
    },
    methods: {
        cancel: function () {
            this.dialog = false;
        },
        submit: function () {
            let changesKeys = Object.keys(this.changes);
            let propsForChanges = this.selectedProperties.map(i => changesKeys[i]);
            let entities = this.selectedEntities.map(i => this.applicableEntities[i]);

            entities.forEach(e => {
                applyProperties(this.entity[this.featureType], e[this.featureType], propsForChanges);
            });
            this.dialog = false;
        }
    }
});