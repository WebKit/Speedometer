import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { TodoHeaderComponent } from "./todo-header/todo-header.component";
import { TodoListComponent } from "./todo-list/todo-list.component";
import { TodoFooterComponent } from "./todo-footer/todo-footer.component";
import { TodoItemComponent } from "./todo-item/todo-item.component";
import * as i0 from "@angular/core";
export class AppModule {
}
AppModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.3.0", ngImport: i0, type: AppModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
AppModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.3.0", ngImport: i0, type: AppModule, bootstrap: [AppComponent], declarations: [AppComponent, TodoHeaderComponent, TodoListComponent, TodoFooterComponent, TodoItemComponent], imports: [BrowserModule, AppRoutingModule, ReactiveFormsModule] });
AppModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.3.0", ngImport: i0, type: AppModule, imports: [BrowserModule, AppRoutingModule, ReactiveFormsModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.3.0", ngImport: i0, type: AppModule, decorators: [{
            type: NgModule,
            args: [{
                    declarations: [AppComponent, TodoHeaderComponent, TodoListComponent, TodoFooterComponent, TodoItemComponent],
                    imports: [BrowserModule, AppRoutingModule, ReactiveFormsModule],
                    providers: [],
                    bootstrap: [AppComponent],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9saWIvYXBwL2FwcC5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNyRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFFMUQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDeEQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBQzFFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ3BFLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBQzFFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGlDQUFpQyxDQUFDOztBQVFwRSxNQUFNLE9BQU8sU0FBUzs7c0dBQVQsU0FBUzt1R0FBVCxTQUFTLGNBRk4sWUFBWSxrQkFIVCxZQUFZLEVBQUUsbUJBQW1CLEVBQUUsaUJBQWlCLEVBQUUsbUJBQW1CLEVBQUUsaUJBQWlCLGFBQ2pHLGFBQWEsRUFBRSxnQkFBZ0IsRUFBRSxtQkFBbUI7dUdBSXJELFNBQVMsWUFKUixhQUFhLEVBQUUsZ0JBQWdCLEVBQUUsbUJBQW1COzJGQUlyRCxTQUFTO2tCQU5yQixRQUFRO21CQUFDO29CQUNOLFlBQVksRUFBRSxDQUFDLFlBQVksRUFBRSxtQkFBbUIsRUFBRSxpQkFBaUIsRUFBRSxtQkFBbUIsRUFBRSxpQkFBaUIsQ0FBQztvQkFDNUcsT0FBTyxFQUFFLENBQUMsYUFBYSxFQUFFLGdCQUFnQixFQUFFLG1CQUFtQixDQUFDO29CQUMvRCxTQUFTLEVBQUUsRUFBRTtvQkFDYixTQUFTLEVBQUUsQ0FBQyxZQUFZLENBQUM7aUJBQzVCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgUmVhY3RpdmVGb3Jtc01vZHVsZSB9IGZyb20gXCJAYW5ndWxhci9mb3Jtc1wiO1xuaW1wb3J0IHsgQnJvd3Nlck1vZHVsZSB9IGZyb20gXCJAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyXCI7XG5cbmltcG9ydCB7IEFwcFJvdXRpbmdNb2R1bGUgfSBmcm9tIFwiLi9hcHAtcm91dGluZy5tb2R1bGVcIjtcbmltcG9ydCB7IEFwcENvbXBvbmVudCB9IGZyb20gXCIuL2FwcC5jb21wb25lbnRcIjtcbmltcG9ydCB7IFRvZG9IZWFkZXJDb21wb25lbnQgfSBmcm9tIFwiLi90b2RvLWhlYWRlci90b2RvLWhlYWRlci5jb21wb25lbnRcIjtcbmltcG9ydCB7IFRvZG9MaXN0Q29tcG9uZW50IH0gZnJvbSBcIi4vdG9kby1saXN0L3RvZG8tbGlzdC5jb21wb25lbnRcIjtcbmltcG9ydCB7IFRvZG9Gb290ZXJDb21wb25lbnQgfSBmcm9tIFwiLi90b2RvLWZvb3Rlci90b2RvLWZvb3Rlci5jb21wb25lbnRcIjtcbmltcG9ydCB7IFRvZG9JdGVtQ29tcG9uZW50IH0gZnJvbSBcIi4vdG9kby1pdGVtL3RvZG8taXRlbS5jb21wb25lbnRcIjtcblxuQE5nTW9kdWxlKHtcbiAgICBkZWNsYXJhdGlvbnM6IFtBcHBDb21wb25lbnQsIFRvZG9IZWFkZXJDb21wb25lbnQsIFRvZG9MaXN0Q29tcG9uZW50LCBUb2RvRm9vdGVyQ29tcG9uZW50LCBUb2RvSXRlbUNvbXBvbmVudF0sXG4gICAgaW1wb3J0czogW0Jyb3dzZXJNb2R1bGUsIEFwcFJvdXRpbmdNb2R1bGUsIFJlYWN0aXZlRm9ybXNNb2R1bGVdLFxuICAgIHByb3ZpZGVyczogW10sXG4gICAgYm9vdHN0cmFwOiBbQXBwQ29tcG9uZW50XSxcbn0pXG5leHBvcnQgY2xhc3MgQXBwTW9kdWxlIHt9XG4iXX0=