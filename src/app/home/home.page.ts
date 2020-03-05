import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {headingDistanceTo, insideCircle} from 'geolocation-utils'; // https://www.npmjs.com/package/geolocation-utils library
import {Geolocation} from '@ionic-native/geolocation/ngx';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
    searchText = '';
    suggessionList: any = [];
    hideList = false;
    loading = false;
    selectedAddr: any;
    deviceLoc = {
        lat: 0,
        lon: 0
    };
    radius = 1000;
    errMsg = '';
    successMsg = '';
    calcDistance: any;

    constructor(
        private http: HttpClient,
        private geolocation: Geolocation
    ) {
    }

    searchRestaurant = (searchText: string) => `https://api.tomtom.com/search/2/search/${searchText}.json?&key=d6pSLblsERciBGplrreUfXMhwtsZXA2F`;

    ngOnInit() {
        this.getDeviceLocation();
        this.geolocation.watchPosition().subscribe((data) => {
            // data can be a set of coordinates, or an error (if an error occurred).
            // data.coords.latitude
            // data.coords.longitude
            if (data && data.coords && data.coords.latitude) {
                this.deviceLoc.lat = data.coords.latitude;
                this.deviceLoc.lon = data.coords.longitude;
            }
        });
    }

    getDeviceLocation() {
        this.geolocation.getCurrentPosition().then((resp) => {
            // resp.coords.latitude
            // resp.coords.longitude
            if (resp && resp.coords && resp.coords.latitude) {
                this.deviceLoc.lat = resp.coords.latitude;
                this.deviceLoc.lon = resp.coords.longitude;
            }
        }).catch((error) => {
            console.log('Error getting location', error);
        });


    }

    serachRestaurant(searchText) {
        this.errMsg = '';
        this.successMsg = '';
        if (searchText.length > 0) {
            this.loading = true;
            this.hideList = false;
            this.http.get(this.searchRestaurant(searchText)).subscribe((response: any) => {
                this.loading = false;
                console.log(response);
                this.suggessionList = [];
                if (response) {
                    this.suggessionList = response.results;
                }
            }, error => {
                this.loading = false;
                console.log(error);
            });
        }
    }

    selectAddr(item, isGps?) {
        console.log(item, isGps);
        this.selectedAddr = item;
        this.hideList = true;
    }

    validateLocation() {
        this.errMsg = '';
        this.successMsg = '';
        if (!this.selectedAddr || !this.selectedAddr.position) {
            this.errMsg = 'Please search and select address';
            return;
        }
        if (!this.radius) {
            this.errMsg = 'Please enter radius';
            return;
        }
        const center = {lat: this.selectedAddr.position.lat, lon: this.selectedAddr.position.lon};
        const radius = this.radius; // meters
        console.log('Device Location : ', {lat: this.deviceLoc.lat, lon: this.deviceLoc.lon});
        console.log('Searched Location : ', {lat: this.selectedAddr.position.lat, lon: this.selectedAddr.position.lon});
        const params = {
            lat: this.deviceLoc.lat,
            lon: this.deviceLoc.lon
        };
        if (insideCircle(params, center, radius)) {
            this.successMsg = 'Awesome you are in the zone';
        } else {
            this.errMsg = 'Sorry! you are not in the zone';
        }
    }

    calculateDistance() {
        if (!this.selectedAddr || !this.selectedAddr.position) {
            this.errMsg = 'Please search and select address';
            return;
        }
        if (!this.deviceLoc && this.deviceLoc.lat === 0) {
            this.errMsg = 'Please enter device location';
            return;
        }
        this.calcDistance = headingDistanceTo(this.deviceLoc, this.selectedAddr.position);
    }
}
