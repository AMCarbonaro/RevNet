import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { RevNetActions } from '../../store/actions/revnet.actions';
import { selectSelectedServer, selectCurrentUser } from '../../store/selectors/revnet.selectors';
import { Server, User } from '../../store/models/revnet.models';

@Component({
  selector: 'app-server-settings-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Server Settings</h2>
          <button class="close-btn" (click)="closeModal()">×</button>
        </div>
        
        <div class="settings-container">
          <!-- Server Overview Tab -->
          <div class="tab-content" *ngIf="activeTab === 'overview'">
            <div class="form-group">
              <label for="serverName">Server Name</label>
              <input
                type="text"
                id="serverName"
                [(ngModel)]="serverData.name"
                class="form-input"
                [disabled]="!canEdit"
              />
            </div>

            <div class="form-group">
              <label for="serverDescription">Description</label>
              <textarea
                id="serverDescription"
                [(ngModel)]="serverData.description"
                class="form-textarea"
                rows="3"
                [disabled]="!canEdit"
              ></textarea>
            </div>

            <div class="form-group">
              <label>Server Icon</label>
              <div class="icon-upload">
                <div class="icon-preview" *ngIf="serverData.icon || iconPreview">
                  <img [src]="iconPreview || serverData.icon" alt="Server icon" />
                </div>
                <div class="icon-placeholder" *ngIf="!serverData.icon && !iconPreview">
                  <svg width="48" height="48" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <input
                  type="file"
                  (change)="onIconChange($event)"
                  accept="image/*"
                  class="file-input"
                  [disabled]="!canEdit"
                />
                <label class="file-label" [class.disabled]="!canEdit">
                  {{ serverData.icon || iconPreview ? 'Change Icon' : 'Upload Icon' }}
                </label>
              </div>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  [(ngModel)]="serverData.isPublic"
                  [disabled]="!canEdit"
                />
                <span class="checkmark"></span>
                Public Server
              </label>
              <div class="checkbox-description">
                Anyone can discover and join this server
              </div>
            </div>
          </div>

          <!-- Members Tab -->
          <div class="tab-content" *ngIf="activeTab === 'members'">
            <div class="members-header">
              <h3>Members ({{ members.length }})</h3>
              <div class="search-box">
                <input
                  type="text"
                  placeholder="Search members..."
                  [(ngModel)]="memberSearchTerm"
                  class="search-input"
                />
              </div>
            </div>
            
            <div class="members-list">
              <div 
                *ngFor="let member of filteredMembers" 
                class="member-item"
                [class.owner]="member.isOwner"
                [class.admin]="member.isAdmin">
                <div class="member-avatar">
                  {{ member.username.charAt(0).toUpperCase() }}
                </div>
                <div class="member-info">
                  <div class="member-name">
                    {{ member.username }}
                    <span class="member-badge" *ngIf="member.isOwner">Owner</span>
                    <span class="member-badge admin" *ngIf="member.isAdmin && !member.isOwner">Admin</span>
                  </div>
                  <div class="member-status">{{ member.status }}</div>
                </div>
                <div class="member-actions" *ngIf="canManageMembers && !member.isOwner">
                  <button class="action-btn kick" (click)="kickMember(member.id)">Kick</button>
                  <button class="action-btn ban" (click)="banMember(member.id)">Ban</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Roles Tab -->
          <div class="tab-content" *ngIf="activeTab === 'roles'">
            <div class="roles-header">
              <h3>Roles</h3>
              <button class="btn btn-primary" (click)="createRole()" *ngIf="canManageRoles">
                Create Role
              </button>
            </div>
            
            <div class="roles-list">
              <div *ngFor="let role of roles" class="role-item">
                <div class="role-color" [style.background-color]="role.color"></div>
                <div class="role-info">
                  <div class="role-name">{{ role.name }}</div>
                  <div class="role-members">{{ role.memberCount }} members</div>
                </div>
                <div class="role-actions" *ngIf="canManageRoles">
                  <button class="action-btn" (click)="editRole(role.id)">Edit</button>
                  <button class="action-btn delete" (click)="deleteRole(role.id)">Delete</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Invites Tab -->
          <div class="tab-content" *ngIf="activeTab === 'invites'">
            <div class="invites-header">
              <h3>Invite Links</h3>
              <button class="btn btn-primary" (click)="createInvite()" *ngIf="canCreateInvites">
                Create Invite
              </button>
            </div>
            
            <div class="invites-list">
              <div *ngFor="let invite of invites" class="invite-item">
                <div class="invite-info">
                  <div class="invite-code">{{ invite.code }}</div>
                  <div class="invite-details">
                    Created by {{ invite.creator }} • {{ invite.uses }}/{{ invite.maxUses || '∞' }} uses
                  </div>
                </div>
                <div class="invite-actions">
                  <button class="action-btn" (click)="copyInvite(invite.code)">Copy</button>
                  <button class="action-btn delete" (click)="revokeInvite(invite.id)">Revoke</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Discovery Tab -->
          <div class="tab-content" *ngIf="activeTab === 'discovery'">
            <div class="discovery-settings">
              <h3>Server Discovery</h3>
              <p>Control how your server appears in public discovery.</p>
              
              <div class="form-group">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    [(ngModel)]="serverData.isDiscoverable"
                    [disabled]="!canEdit"
                  />
                  <span class="checkmark"></span>
                  Make server discoverable
                </label>
                <div class="checkbox-description">
                  Allow users to find and join your server through public discovery
                </div>
              </div>

              <div class="form-group" *ngIf="serverData.isDiscoverable">
                <label for="serverCategory">Category</label>
                <select
                  id="serverCategory"
                  [(ngModel)]="serverData.category"
                  class="form-input"
                  [disabled]="!canEdit">
                  <option value="">Select a category</option>
                  <option value="gaming">Gaming</option>
                  <option value="education">Education</option>
                  <option value="music">Music</option>
                  <option value="art">Art</option>
                  <option value="technology">Technology</option>
                  <option value="science">Science</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="sports">Sports</option>
                  <option value="lifestyle">Lifestyle</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div class="form-group" *ngIf="serverData.isDiscoverable">
                <label for="serverTags">Tags</label>
                <div class="tags-input">
                  <div class="tags-display">
                    <span 
                      *ngFor="let tag of serverData.tags || []; let i = index" 
                      class="tag">
                      {{ tag }}
                      <button 
                        type="button" 
                        class="tag-remove"
                        (click)="removeTag(i)"
                        [disabled]="!canEdit">
                        ×
                      </button>
                    </span>
                  </div>
                  <input
                    type="text"
                    [(ngModel)]="newTag"
                    (keydown.enter)="addTag()"
                    placeholder="Add a tag..."
                    class="tag-input"
                    [disabled]="!canEdit"
                  />
                </div>
                <div class="form-help">
                  Add up to 5 tags to help users find your server
                </div>
              </div>

              <div class="form-group" *ngIf="serverData.isDiscoverable">
                <label for="serverShortDescription">Short Description</label>
                <textarea
                  id="serverShortDescription"
                  [(ngModel)]="serverData.shortDescription"
                  class="form-textarea"
                  rows="3"
                  maxlength="200"
                  placeholder="Brief description of your server..."
                  [disabled]="!canEdit"
                ></textarea>
                <div class="form-help">
                  {{ (serverData.shortDescription || '').length }}/200 characters
                </div>
              </div>

              <div class="preview-card" *ngIf="serverData.isDiscoverable">
                <h4>Discovery Preview</h4>
                <div class="server-card-preview">
                  <div class="preview-icon">
                    <img 
                      *ngIf="serverData.icon || iconPreview" 
                      [src]="iconPreview || serverData.icon" 
                      alt="Server icon" />
                    <div 
                      *ngIf="!serverData.icon && !iconPreview" 
                      class="preview-icon-placeholder">
                      {{ serverData.name?.charAt(0)?.toUpperCase() || 'S' }}
                    </div>
                  </div>
                  <div class="preview-info">
                    <h5>{{ serverData.name || 'Server Name' }}</h5>
                    <p class="preview-description">
                      {{ serverData.shortDescription || 'No description provided' }}
                    </p>
                    <div class="preview-tags" *ngIf="serverData.tags?.length">
                      <span 
                        *ngFor="let tag of serverData.tags" 
                        class="preview-tag">
                        {{ tag }}
                      </span>
                    </div>
                    <div class="preview-stats">
                      <span>{{ serverData.memberCount || 0 }} members</span>
                      <span *ngIf="serverData.category">{{ serverData.category }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Danger Zone Tab -->
          <div class="tab-content" *ngIf="activeTab === 'danger'">
            <div class="danger-zone">
              <h3>Danger Zone</h3>
              <p>These actions are irreversible. Please be certain.</p>
              
              <div class="danger-item">
                <div class="danger-info">
                  <h4>Delete Server</h4>
                  <p>Permanently delete this server and all its data.</p>
                </div>
                <button 
                  class="btn btn-danger" 
                  (click)="deleteServer()"
                  *ngIf="canDeleteServer">
                  Delete Server
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab Navigation -->
        <div class="tab-navigation">
          <button 
            *ngFor="let tab of tabs" 
            class="tab-btn"
            [class.active]="activeTab === tab.id"
            (click)="setActiveTab(tab.id)"
            [disabled]="!tab.enabled">
            {{ tab.name }}
          </button>
        </div>

        <!-- Modal Actions -->
        <div class="modal-actions" *ngIf="activeTab === 'overview'">
          <button type="button" class="btn btn-secondary" (click)="closeModal()">
            Cancel
          </button>
          <button 
            type="button" 
            class="btn btn-primary"
            (click)="saveSettings()"
            [disabled]="!canEdit || isSaving">
            <span *ngIf="isSaving" class="spinner"></span>
            {{ isSaving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
    }

    .modal-content {
      background: #2f3136;
      border-radius: 12px;
      width: 90%;
      max-width: 800px;
      max-height: 90vh;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      animation: modalSlideIn 0.3s ease-out;
      display: flex;
      flex-direction: column;
    }

    @keyframes modalSlideIn {
      from {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border-bottom: 1px solid #40444b;
      flex-shrink: 0;

      h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
        color: #dcddde;
      }

      .close-btn {
        background: none;
        border: none;
        color: #72767d;
        font-size: 24px;
        line-height: 1;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.1s ease;
        cursor: pointer;

        &:hover {
          background: #40444b;
          color: #dcddde;
        }
      }
    }

    .settings-container {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      min-height: 400px;
    }

    .tab-content {
      animation: fadeIn 0.3s ease-in-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .form-group {
      margin-bottom: 16px;

      label {
        display: block;
        font-weight: 600;
        color: #dcddde;
        margin-bottom: 8px;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .form-input,
      .form-textarea {
        width: 100%;
        background: #202225;
        border: 1px solid #40444b;
        border-radius: 6px;
        padding: 12px;
        color: #dcddde;
        font-size: 14px;
        transition: all 0.1s ease;

        &:focus {
          outline: none;
          border-color: #5865f2;
          box-shadow: 0 0 0 2px rgba(88, 101, 242, 0.2);
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        &::placeholder {
          color: #72767d;
        }
      }

      .form-textarea {
        resize: vertical;
        min-height: 80px;
        font-family: inherit;
      }
    }

    .icon-upload {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border: 2px dashed #40444b;
      border-radius: 8px;
      transition: all 0.1s ease;

      &:hover {
        border-color: #5865f2;
        background: rgba(88, 101, 242, 0.05);
      }

      .icon-preview {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        overflow: hidden;
        border: 2px solid #40444b;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .icon-placeholder {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: #202225;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #72767d;
        border: 2px solid #40444b;
      }

      .file-input {
        display: none;
      }

      .file-label {
        background: none;
        border: none;
        background: #5865f2;
        color: #ffffff;
        padding: 8px 16px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.1s ease;

        &:hover:not(.disabled) {
          background: #4752c4;
        }

        &.disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-weight: 500;
      color: #dcddde;

      input[type="checkbox"] {
        display: none;
      }

      .checkmark {
        width: 20px;
        height: 20px;
        border: 2px solid #40444b;
        border-radius: 4px;
        position: relative;
        transition: all 0.1s ease;

        &::after {
          content: '';
          position: absolute;
          left: 6px;
          top: 2px;
          width: 6px;
          height: 10px;
          border: solid #ffffff;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
          opacity: 0;
          transition: opacity 0.1s ease;
        }
      }

      input[type="checkbox"]:checked + .checkmark {
        background: #5865f2;
        border-color: #5865f2;

        &::after {
          opacity: 1;
        }
      }
    }

    .checkbox-description {
      font-size: 12px;
      color: #72767d;
      margin-top: 4px;
      margin-left: 32px;
    }

    .members-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      h3 {
        margin: 0;
        color: #dcddde;
      }

      .search-box {
        .search-input {
          background: #202225;
          border: 1px solid #40444b;
          border-radius: 6px;
          padding: 8px 12px;
          color: #dcddde;
          width: 200px;

          &:focus {
            outline: none;
            border-color: #5865f2;
          }
        }
      }
    }

    .members-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .member-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #202225;
      border-radius: 8px;
      transition: all 0.1s ease;

      &:hover {
        background: #40444b;
      }

      &.owner {
        border-left: 4px solid #5865f2;
      }

      &.admin {
        border-left: 4px solid #ed4245;
      }

      .member-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #5865f2;
        color: #ffffff;
        font-weight: 600;
        flex-shrink: 0;
      }

      .member-info {
        flex-grow: 1;

        .member-name {
          font-weight: 600;
          color: #dcddde;
          display: flex;
          align-items: center;
          gap: 8px;

          .member-badge {
            background: #40444b;
            color: #72767d;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 600;

            &.admin {
              background: #ed4245;
              color: #ffffff;
            }
          }
        }

        .member-status {
          font-size: 12px;
          color: #72767d;
        }
      }

      .member-actions {
        display: flex;
        gap: 8px;

        .action-btn {
          background: none;
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.1s ease;
          cursor: pointer;

          &.kick {
            background: #faa61a;
            color: #000000;

            &:hover {
              background: #e0991a;
            }
          }

          &.ban {
            background: #ed4245;
            color: #ffffff;

            &:hover {
              background: #d63c3e;
            }
          }
        }
      }
    }

    .tab-navigation {
      display: flex;
      border-top: 1px solid #40444b;
      background: #36393f;
      flex-shrink: 0;

      .tab-btn {
        background: none;
        border: none;
        padding: 12px 16px;
        color: #72767d;
        font-weight: 600;
        transition: all 0.1s ease;
        border-bottom: 2px solid transparent;
        cursor: pointer;

        &:hover:not(:disabled) {
          color: #dcddde;
          background: #40444b;
        }

        &.active {
          color: #dcddde;
          border-bottom-color: #5865f2;
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px;
      border-top: 1px solid #40444b;
      background: #36393f;
      flex-shrink: 0;

      .btn {
        background: none;
        border: none;
        padding: 12px 16px;
        border-radius: 6px;
        font-weight: 600;
        transition: all 0.1s ease;
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 120px;
        justify-content: center;
        cursor: pointer;

        &.btn-secondary {
          background: #202225;
          color: #dcddde;
          border: 1px solid #40444b;

          &:hover {
            background: #40444b;
          }
        }

        &.btn-primary {
          background: #5865f2;
          color: #ffffff;

          &:hover:not(:disabled) {
            background: #4752c4;
          }

          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        }

        &.btn-danger {
          background: #ed4245;
          color: #ffffff;

          &:hover {
            background: #d63c3e;
          }
        }
      }
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    }

    // Discovery tab styles
    .discovery-settings {
      h3 {
        margin: 0 0 8px 0;
        color: #dcddde;
        font-size: 16px;
        font-weight: 600;
      }

      > p {
        margin: 0 0 24px 0;
        color: #72767d;
        font-size: 14px;
      }
    }

    .tags-input {
      .tags-display {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 8px;
        min-height: 32px;
        padding: 8px;
        background: #202225;
        border: 1px solid #40444b;
        border-radius: 6px;

        .tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #5865f2;
          color: #ffffff;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;

          .tag-remove {
            background: none;
            border: none;
            color: #ffffff;
            cursor: pointer;
            font-size: 14px;
            line-height: 1;
            padding: 0;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.1s ease;

            &:hover:not(:disabled) {
              background: rgba(255, 255, 255, 0.2);
            }

            &:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }
          }
        }
      }

      .tag-input {
        width: 100%;
        background: none;
        border: none;
        color: #dcddde;
        font-size: 14px;
        outline: none;

        &::placeholder {
          color: #72767d;
        }
      }
    }

    .form-help {
      font-size: 12px;
      color: #72767d;
      margin-top: 4px;
    }

    .preview-card {
      margin-top: 24px;
      padding: 16px;
      background: #202225;
      border-radius: 8px;
      border: 1px solid #40444b;

      h4 {
        margin: 0 0 12px 0;
        color: #dcddde;
        font-size: 14px;
        font-weight: 600;
      }

      .server-card-preview {
        display: flex;
        gap: 12px;
        align-items: flex-start;

        .preview-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .preview-icon-placeholder {
            width: 100%;
            height: 100%;
            background: #5865f2;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 18px;
          }
        }

        .preview-info {
          flex: 1;
          min-width: 0;

          h5 {
            margin: 0 0 4px 0;
            color: #dcddde;
            font-size: 14px;
            font-weight: 600;
          }

          .preview-description {
            margin: 0 0 8px 0;
            color: #72767d;
            font-size: 12px;
            line-height: 1.4;
          }

          .preview-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            margin-bottom: 8px;

            .preview-tag {
              background: #40444b;
              color: #72767d;
              padding: 2px 6px;
              border-radius: 8px;
              font-size: 10px;
              font-weight: 500;
            }
          }

          .preview-stats {
            display: flex;
            gap: 12px;
            font-size: 11px;
            color: #72767d;

            span {
              &:first-child {
                color: #dcddde;
                font-weight: 500;
              }
            }
          }
        }
      }
    }
  `]
})
export class ServerSettingsModalComponent implements OnInit, OnDestroy {
  @Input() serverId: string | null = null;
  @Output() modalClosed = new EventEmitter<void>();

  activeTab = 'overview';
  serverData: any = {};
  iconPreview: string | null = null;
  isSaving = false;
  memberSearchTerm = '';
  newTag = '';

  // Mock data - in real app, this would come from store/API
  members = [
    { id: '1', username: 'CurrentUser', status: 'online', isOwner: true, isAdmin: false },
    { id: '2', username: 'TestUser', status: 'away', isOwner: false, isAdmin: true },
    { id: '3', username: 'Member1', status: 'online', isOwner: false, isAdmin: false },
    { id: '4', username: 'Member2', status: 'offline', isOwner: false, isAdmin: false }
  ];

  roles = [
    { id: '1', name: 'Owner', color: '#7289da', memberCount: 1 },
    { id: '2', name: 'Admin', color: '#f04747', memberCount: 1 },
    { id: '3', name: 'Moderator', color: '#faa61a', memberCount: 0 },
    { id: '4', name: 'Member', color: '#99aab5', memberCount: 2 }
  ];

  invites = [
    { id: '1', code: 'abc123', creator: 'CurrentUser', uses: 5, maxUses: 100 },
    { id: '2', code: 'def456', creator: 'TestUser', uses: 0, maxUses: null }
  ];

  tabs = [
    { id: 'overview', name: 'Overview', enabled: true },
    { id: 'members', name: 'Members', enabled: true },
    { id: 'roles', name: 'Roles', enabled: true },
    { id: 'invites', name: 'Invites', enabled: true },
    { id: 'discovery', name: 'Discovery', enabled: true },
    { id: 'danger', name: 'Danger Zone', enabled: true }
  ];

  currentUser$: Observable<User | null>;
  selectedServer$: Observable<Server | null>;

  // Permission checks
  canEdit = false;
  canManageMembers = false;
  canManageRoles = false;
  canCreateInvites = false;
  canDeleteServer = false;

  private destroy$ = new Subject<void>();

  constructor(private store: Store) {
    this.currentUser$ = this.store.select(selectCurrentUser);
    this.selectedServer$ = this.store.select(selectSelectedServer);
  }

  ngOnInit(): void {
    this.selectedServer$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(server => {
      if (server) {
        this.serverData = { ...server };
        this.checkPermissions(server);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  checkPermissions(server: Server): void {
    // In a real app, this would check user roles and permissions
    this.canEdit = server.owner;
    this.canManageMembers = server.owner;
    this.canManageRoles = server.owner;
    this.canCreateInvites = server.owner;
    this.canDeleteServer = server.owner;
  }

  get filteredMembers() {
    if (!this.memberSearchTerm) return this.members;
    return this.members.filter(member =>
      member.username.toLowerCase().includes(this.memberSearchTerm.toLowerCase())
    );
  }

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
  }

  onIconChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert('File size must be less than 8MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.iconPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  saveSettings(): void {
    if (!this.canEdit) return;

    this.isSaving = true;
    
    // Dispatch update action
    this.store.dispatch(RevNetActions.updateRevolt({
      revoltId: this.serverId!,
      updates: this.serverData
    }));

    // Simulate API call
    setTimeout(() => {
      this.isSaving = false;
      this.closeModal();
    }, 1000);
  }

  kickMember(memberId: string): void {
    if (confirm('Are you sure you want to kick this member?')) {
      console.log('Kicking member:', memberId);
      // Implement kick logic
    }
  }

  banMember(memberId: string): void {
    if (confirm('Are you sure you want to ban this member?')) {
      console.log('Banning member:', memberId);
      // Implement ban logic
    }
  }

  createRole(): void {
    console.log('Creating new role');
    // Implement create role logic
  }

  editRole(roleId: string): void {
    console.log('Editing role:', roleId);
    // Implement edit role logic
  }

  deleteRole(roleId: string): void {
    if (confirm('Are you sure you want to delete this role?')) {
      console.log('Deleting role:', roleId);
      // Implement delete role logic
    }
  }

  createInvite(): void {
    console.log('Creating new invite');
    // Implement create invite logic
  }

  copyInvite(code: string): void {
    const currentHost = window.location.host;
    navigator.clipboard.writeText(`${window.location.protocol}//${currentHost}/invite/${code}`);
    // Show success message
  }

  revokeInvite(inviteId: string): void {
    if (confirm('Are you sure you want to revoke this invite?')) {
      console.log('Revoking invite:', inviteId);
      // Implement revoke invite logic
    }
  }

  deleteServer(): void {
    if (confirm('Are you sure you want to delete this server? This action cannot be undone.')) {
      this.store.dispatch(RevNetActions.deleteRevolt({ revoltId: this.serverId! }));
      this.closeModal();
    }
  }

  closeModal(): void {
    this.modalClosed.emit();
  }

  addTag(): void {
    if (!this.newTag.trim() || !this.canEdit) return;
    
    if (!this.serverData.tags) {
      this.serverData.tags = [];
    }
    
    if (this.serverData.tags.length >= 5) {
      alert('Maximum 5 tags allowed');
      return;
    }
    
    const tag = this.newTag.trim().toLowerCase();
    if (!this.serverData.tags.includes(tag)) {
      this.serverData.tags.push(tag);
    }
    
    this.newTag = '';
  }

  removeTag(index: number): void {
    if (!this.canEdit) return;
    
    this.serverData.tags.splice(index, 1);
  }
}
