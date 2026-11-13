// Copyright (c) 2026, Camillo Bruni.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

import { Component, ChangeDetectorRef, ElementRef, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrackStateService } from '../services/track-state.service';
import { MapView } from '../map';
import { METRICS } from '../metrics';
import {
  CourseViewModel,
  CourseTrackEffortView,
  computeCoursesViewData,
  createNewCourseItem,
  deleteCourseById,
  editCourseById,
  prepareBenchmarkCourses,
  registerCoursesComponent,
  renameCourseById,
  selectCourse,
  selectCourseTrackEffort,
  setCoursesEditMode,
  toggleCourseHeader,
} from '../tabs/courses';

@Component({
  selector: 'app-courses-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="courses-tab-host"
      [attr.data-courses-count]="courseViews.length"
      [attr.data-matches]="totalMatchesCount"
      [attr.data-corridor-deviation]="corridorDeviationStr"
    >
      <div class="evolution-toolbar" *ngIf="!isResetEmpty || courseViews.length > 0">
        <div
          class="evolution-toolbar-left"
          style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;"
        >
          <form
            class="course-create-form"
            (ngSubmit)="onCreateCourseSubmit()"
            style="display: flex; align-items: center; gap: 6px;"
          >
            <input
              type="text"
              class="course-create-name-input"
              [(ngModel)]="newCourseName"
              name="newCourseName"
              placeholder="New course sector name..."
              style="background: var(--bg); border: 1px solid var(--border); color: var(--text); font-size: 11px; padding: 4px 8px; border-radius: 4px; width: 170px;"
            />
            <input
              type="number"
              class="course-create-radius-input"
              [(ngModel)]="newCourseRadius"
              name="newCourseRadius"
              min="20"
              max="2000"
              step="50"
              title="Corridor Gate Radius (m)"
              style="background: var(--bg); border: 1px solid var(--border); color: var(--text); font-size: 11px; padding: 4px 6px; border-radius: 4px; width: 64px;"
            />
            <button
              type="submit"
              class="seg-btn"
              title="Create Course Sector"
              style="padding: 3px 8px; font-size: 11px;"
            >
              + Create
            </button>
          </form>
          <div
            class="course-corridor-summary"
            *ngIf="selectedCourseSummary"
            [attr.data-courses-count]="courseViews.length"
            [attr.data-matches]="totalMatchesCount"
            [attr.data-corridor-deviation]="corridorDeviationStr"
            style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text-muted);"
          >
            <span class="badge" title="Active Course">{{ selectedCourseSummary.name }}</span>
            <span class="badge" title="Corridor Gate Count"
              >{{ selectedCourseSummary.pointsCount }} gates</span
            >
            <span class="badge" title="Total Matched Efforts"
              >{{ totalMatchesCount }} matched efforts</span
            >
            <span class="badge" title="Banded DTW &amp; Gate Corridor Deviation"
              >DTW Dev: {{ corridorDeviationStr }}m</span
            >
          </div>
        </div>
        <div class="evolution-toolbar-right">
          <button
            *ngIf="isEditMode"
            id="btn-done-edit"
            class="icon-btn"
            title="Done Editing"
            (click)="onDoneEdit()"
          >
            <span class="material-symbols-rounded">done</span>
          </button>
          <button
            *ngIf="!isEditMode"
            id="btn-new-course"
            class="icon-btn"
            title="New Course"
            (click)="onNewCourseClick()"
          >
            <span class="material-symbols-rounded">add_circle</span>
          </button>
        </div>
      </div>

      <div class="courses-container">
        <div id="courses-list" class="courses-list">
          <div id="courses-empty" class="empty-state" *ngIf="courseViews.length === 0">
            <span class="material-symbols-rounded empty-icon">route</span>
            <div class="empty-text">No courses created yet</div>
          </div>

          <div
            *ngFor="let c of courseViews; trackBy: trackByCourseId"
            class="course-item"
            [class.open]="c.isOpen"
            [attr.data-id]="c.id"
          >
            <div class="course-item-header" (click)="onCourseHeaderClick(c.id, $event)">
              <span class="material-symbols-rounded expand-icon">{{
                c.isOpen ? 'expand_more' : 'chevron_right'
              }}</span>

              <div class="course-name" *ngIf="renamingCourseId !== c.id">
                {{ c.name }}
                <span
                  class="material-symbols-rounded btn-rename-course clickable"
                  style="font-size: 14px; color: var(--text-muted);"
                  title="Rename"
                  (click)="onStartRename(c, $event)"
                  >edit</span
                >
              </div>

              <div
                class="course-name"
                *ngIf="renamingCourseId === c.id"
                (click)="$event.stopPropagation()"
              >
                <input
                  type="text"
                  class="course-name-input"
                  [(ngModel)]="renameInputText"
                  name="renameCourseField"
                  (blur)="onSaveRename(c.id)"
                  (keydown.enter)="onSaveRename(c.id)"
                  (keydown.escape)="onCancelRename()"
                  style="background: var(--bg); border: 1px solid var(--border); color: var(--text); font-size: inherit; padding: 2px 4px; border-radius: 4px; width: 80%;"
                />
              </div>

              <div class="course-meta">
                <span
                  class="material-symbols-rounded"
                  style="font-size: 14px; vertical-align: middle;"
                  title="Distance"
                  >straighten</span
                >
                {{ c.distanceKm }} km | {{ c.pointsCount }} points | {{ c.matchingCount }} matching
                tracks
              </div>

              <div class="course-actions" (click)="$event.stopPropagation()">
                <button
                  class="btn-edit-course icon-btn"
                  title="Edit Course"
                  (click)="onEditCourse(c.id, $event)"
                >
                  <span class="material-symbols-rounded">edit</span>
                </button>
                <button
                  class="btn-delete-course icon-btn danger"
                  title="Delete Course"
                  (click)="onDeleteCourse(c.id, $event)"
                >
                  <span class="material-symbols-rounded">delete</span>
                </button>
              </div>
            </div>

            <div class="course-tracks" *ngIf="c.isOpen">
              <div class="empty-text" *ngIf="c.matchedTracks.length === 0">No matching tracks</div>
              <table class="course-tracks-table" *ngIf="c.matchedTracks.length > 0">
                <thead>
                  <tr>
                    <th>Track ({{ c.matchedTracks.length }})</th>
                    <th>
                      <span class="material-symbols-rounded metric-icon date" title="Date"
                        >calendar_today</span
                      >
                      Date
                    </th>
                    <th>
                      <span class="material-symbols-rounded metric-icon" title="Distance"
                        >straighten</span
                      >
                      Distance
                    </th>
                    <th>
                      <span class="material-symbols-rounded metric-icon duration" title="Duration"
                        >timer</span
                      >
                      Duration
                    </th>
                    <th>
                      <span class="material-symbols-rounded metric-icon speed" title="Avg Speed"
                        >speed</span
                      >
                      Speed
                    </th>
                    <th>
                      <span class="material-symbols-rounded metric-icon speed" title="Avg Pace"
                        >speed</span
                      >
                      Pace
                    </th>
                    <th>
                      <span
                        class="material-symbols-rounded metric-icon"
                        [style.color]="vamColor"
                        title="Avg VAM"
                        >trending_up</span
                      >
                      VAM
                    </th>
                    <th>
                      <span class="material-symbols-rounded metric-icon power" title="Avg Power"
                        >bolt</span
                      >
                      Power
                    </th>
                    <th>
                      <span class="material-symbols-rounded metric-icon hr" title="Avg Heart Rate"
                        >favorite</span
                      >
                      HR
                    </th>
                    <th>
                      <span
                        class="material-symbols-rounded metric-icon"
                        title="Q1–Q4 Sector Power Splits"
                        >view_column</span
                      >
                      Q1–Q4 Splits
                    </th>
                    <th>
                      <span
                        class="material-symbols-rounded metric-icon"
                        title="Virtual Partner Time Gap"
                        >emoji_events</span
                      >
                      Gap
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    *ngFor="let t of c.matchedTracks; let idx = index; trackBy: trackByEffortId"
                    class="course-track-row"
                    [class.selected]="t.isSelected"
                    [attr.data-track-id]="t.id"
                    [attr.data-start]="t.startIdx"
                    [attr.data-end]="t.endIdx"
                    (mouseenter)="onTrackRowHover(t.id, true)"
                    (mouseleave)="onTrackRowHover(t.id, false)"
                  >
                    <td class="track-name-cell clickable" (click)="onTrackRowClick(t, $event)">
                      <div style="display: flex; align-items: center;">
                        <div
                          [style.background]="t.color"
                          style="width: 3px; height: 16px; margin-right: 8px; border-radius: 1px; flex-shrink: 0;"
                        ></div>
                        <span>{{ t.displayName }}</span>
                        <span
                          class="badge"
                          style="margin-left: 6px; font-size: 10px; padding: 1px 4px;"
                          >#{{ idx + 1 }}</span
                        >
                      </div>
                    </td>
                    <td>{{ t.date }}</td>
                    <td>{{ t.distStr }}</td>
                    <td>{{ t.durationStr }}</td>
                    <td>{{ t.speedStr }}</td>
                    <td>{{ t.paceStr }}</td>
                    <td>{{ t.vamStr }}</td>
                    <td>{{ t.wattsStr }}</td>
                    <td>{{ t.hrStr }}</td>
                    <td>
                      <span class="badge" style="font-size: 10px;">{{ t.splitsSummary }}</span>
                    </td>
                    <td>
                      <span
                        class="badge"
                        [style.color]="idx === 0 ? '#4ecdc4' : 'var(--text-muted)'"
                        style="font-size: 10px;"
                        >{{ t.gapLabel }}</span
                      >
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CoursesTabComponent implements OnInit, OnDestroy {
  public state = inject(TrackStateService);
  private cdr = inject(ChangeDetectorRef);
  private elRef = inject(ElementRef<HTMLElement>);

  public courseViews: CourseViewModel[] = [];
  public selectedCourseSummary: CourseViewModel | null = null;
  public totalMatchesCount = 0;
  public corridorDeviationStr = '0.00';
  public isEditMode = false;
  public isResetEmpty = true;

  public newCourseName = '';
  public newCourseRadius = 450;

  public renamingCourseId: string | null = null;
  public renameInputText = '';

  public readonly vamColor = METRICS.vam.color;

  constructor() {
    this.state.coursesTab = this;
    registerCoursesComponent(this);
  }

  ngOnInit(): void {
    const host = this.elRef.nativeElement;
    if (!document.getElementById('courses-view')) {
      host.id = 'courses-view';
    }
  }

  ngOnDestroy(): void {
    if (this.state.coursesTab === this) {
      this.state.coursesTab = null;
    }
  }

  public trackByCourseId(_idx: number, item: CourseViewModel): string {
    return item.id;
  }

  public trackByEffortId(_idx: number, item: CourseTrackEffortView): string {
    return `${item.id}-${item.startIdx}-${item.endIdx}`;
  }

  public reset(): void {
    this.courseViews = [];
    this.selectedCourseSummary = null;
    this.totalMatchesCount = 0;
    this.corridorDeviationStr = '0.00';
    this.isEditMode = false;
    this.isResetEmpty = true;
    this.renamingCourseId = null;
    this.syncHostDataset();
    this.cdr.detectChanges();
  }

  public render(): void {
    this.isResetEmpty = false;
    const payload = computeCoursesViewData();
    this.courseViews = payload.courseViews;
    this.selectedCourseSummary = payload.selectedCourseSummary;
    this.totalMatchesCount = payload.totalMatchesCount;
    this.corridorDeviationStr = payload.corridorDeviationStr;
    this.isEditMode = payload.isEditMode;
    this.syncHostDataset();
    this.cdr.detectChanges();
  }

  public prepareBenchmarkCourses(allTracks: any[]): void {
    prepareBenchmarkCourses(allTracks);
  }

  public selectCourse(id: string, open: boolean = false): void {
    selectCourse(id, open);
  }

  private syncHostDataset(): void {
    const container = document.getElementById('courses-view') || this.elRef.nativeElement;
    if (container) {
      container.dataset.corridorDeviation = this.corridorDeviationStr;
      container.dataset.coursesCount = String(this.courseViews.length);
      container.dataset.matches = String(this.totalMatchesCount);
    }
  }

  public onNewCourseClick(): void {
    createNewCourseItem(this.newCourseName, this.newCourseRadius || 450);
    this.newCourseName = '';
  }

  public onCreateCourseSubmit(): void {
    createNewCourseItem(this.newCourseName, this.newCourseRadius || 450);
    this.newCourseName = '';
  }

  public onDoneEdit(): void {
    setCoursesEditMode(false);
    this.render();
  }

  public onCourseHeaderClick(id: string, event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (target?.closest('.course-actions') || target?.closest('.btn-rename-course')) {
      return;
    }
    toggleCourseHeader(id);
  }

  public onStartRename(c: CourseViewModel, event: MouseEvent): void {
    event.stopPropagation();
    this.renamingCourseId = c.id;
    this.renameInputText = c.name;
    this.cdr.detectChanges();
  }

  public onSaveRename(id: string): void {
    if (this.renamingCourseId !== id) return;
    const text = this.renameInputText;
    this.renamingCourseId = null;
    renameCourseById(id, text);
  }

  public onCancelRename(): void {
    this.renamingCourseId = null;
    this.cdr.detectChanges();
  }

  public onEditCourse(id: string, event: MouseEvent): void {
    event.stopPropagation();
    editCourseById(id);
  }

  public onDeleteCourse(id: string, event: MouseEvent): void {
    event.stopPropagation();
    deleteCourseById(id);
  }

  public onTrackRowClick(t: CourseTrackEffortView, event: MouseEvent): void {
    event.stopPropagation();
    selectCourseTrackEffort(t.id, t.startIdx, t.endIdx);
  }

  public onTrackRowHover(trackId: string, hover: boolean): void {
    MapView.setTrackHover(trackId, hover);
  }
}
