import React, { Component } from 'react';
import { ArrowLeft, Camera, Plus, X, Save, Check, Sparkles } from 'lucide-react';
import { API_BASE } from '../../utils/api';
import DiceBearAvatarSelector from '../common/DiceBearAvatarSelector';
import AIAvatarSculptor from '../common/AIAvatarSculptor';

class Edit extends Component {
  constructor(props) {
    super(props);
    this.fileInputRef = React.createRef();
    
    const { userType, userData } = props;
    
    this.state = {
      // Pre-fill with existing data from App
      fullName: userType === 'worker' ? (userData?.fullName || '') : (userData?.companyName || ''),
      email: userData?.email || '',
      bio: userData?.bio || '',
      location: userData?.location || '',
      skills: Array.isArray(userData?.skills) ? userData.skills : [],
      phone: userData?.phone || '',
      about: userData?.about || '',
      activityType: userData?.activityType || '',
      avatar: userType === 'worker' ? (userData?.avatar || null) : (userData?.logo || null),
      avatarPreview: userType === 'worker' ? (userData?.avatar || null) : (userData?.logo || null),
      newSkill: '',
      saved: false,
      saving: false,
      showAvatarCreator: false,
      showAISculptor: false,
    };
  }

  handleAvatarSelect = (url) => {
    this.setState({
      avatarPreview: url,
      showAvatarCreator: false,
      saved: false
    });
  };

  handleChange = (e) => {
    this.setState({ 
      [e.target.name]: e.target.value,
      saved: false 
    });
  };

  handleImageClick = () => {
    this.fileInputRef.current.click();
  };

  handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        this.setState({ 
          avatarPreview: reader.result,
          saved: false
        });
      };
      reader.readAsDataURL(file);
    }
  };

  addSkill = () => {
    const { newSkill, skills } = this.state;
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      this.setState({
        skills: [...skills, trimmed],
        newSkill: '',
        saved: false
      });
    }
  };

  removeSkill = (skillToRemove) => {
    this.setState(prev => ({
      skills: prev.skills.filter(skill => skill !== skillToRemove),
      saved: false
    }));
  };

  handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.addSkill();
    }
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    this.setState({ saving: true });
    
    const { userType, onUpdate } = this.props;
    
    // Prepare data based on user type
    const updateData = userType === 'worker' ? {
      fullName: this.state.fullName,
      email: this.state.email,
      bio: this.state.bio,
      location: this.state.location,
      skills: this.state.skills,
      phone: this.state.phone,
      avatar: this.state.avatarPreview,
    } : {
      companyName: this.state.fullName,
      email: this.state.email,
      about: this.state.about,
      location: this.state.location,
      activityType: this.state.activityType,
      phone: this.state.phone,
      logo: this.state.avatarPreview,
    };

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (res.ok) {
        const updatedUser = await res.json();
        onUpdate(updatedUser);
        this.setState({ 
          saving: false,
          saved: true,
          avatar: this.state.avatarPreview
        });
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Failed to save profile: ${errorData.message || errorData.error || 'Unknown server error'}`);
        this.setState({ saving: false });
      }
    } catch (error) {
      console.error(error);
      alert('Network error saving profile');
      this.setState({ saving: false });
    }
  };

  getAvatarDisplay = () => {
    const { avatarPreview, avatar } = this.state;
    const { userType } = this.props;
    
    const rawVal = avatarPreview || avatar;
    const isUrl = typeof rawVal === 'string' && (rawVal.startsWith('http') || rawVal.startsWith('data:'));
    
    if (isUrl) {
      return (
        <img 
          src={rawVal} 
          alt="Profile" 
          className="w-24 h-24 rounded-full object-cover border-2 border-white/20"
        />
      );
    }
    
    return (
      <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${
        userType === 'worker' ? 'from-green-400 to-blue-500' : 'from-purple-400 to-pink-500'
      } flex items-center justify-center text-4xl`}>
        {rawVal ? rawVal : (userType === 'worker' ? '👤' : '🏢')}
      </div>
    );
  };

  renderWorkerForm = () => {
    const { fullName, email, bio, location, skills, newSkill, saved, saving } = this.state;

    return (
      <form onSubmit={this.handleSubmit} className="space-y-5">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative cursor-pointer group" onClick={this.handleImageClick}>
            {this.getAvatarDisplay()}
            <div className="absolute bottom-0 right-0 p-2 rounded-full bg-blue-600 text-white group-hover:scale-110 transition">
              <Camera className="w-4 h-4" />
            </div>
          </div>
          <input
            type="file"
            ref={this.fileInputRef}
            onChange={this.handleImageChange}
            accept="image/*"
            className="hidden"
          />
          <div className="flex gap-4 mt-3">
             <button type="button" onClick={this.handleImageClick} className="text-gray-400 text-sm hover:text-white transition">Upload Photo</button>
             <span className="text-gray-600">|</span>
              <button type="button" onClick={() => this.setState({ showAvatarCreator: true })} className="text-gray-400 text-sm hover:text-white transition flex items-center gap-1">
                Classic
              </button>
              <span className="text-gray-600">|</span>
              <button type="button" onClick={() => this.setState({ showAISculptor: true })} className="text-blue-400 text-sm hover:text-blue-300 font-bold transition flex items-center gap-1 animate-pulse">
                <Sparkles className="w-3 h-3" /> AI Sculptor
              </button>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Full Name *</label>
          <input type="text" name="fullName" value={fullName} onChange={this.handleChange} required
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500" />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Email *</label>
          <input type="email" name="email" value={email} onChange={this.handleChange} required
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500" />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Bio</label>
          <textarea name="bio" value={bio} onChange={this.handleChange} rows="3"
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 resize-none" />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Location</label>
          <input type="text" name="location" value={location} onChange={this.handleChange}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500" />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Skills ({skills.length})</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {skills.map((skill, i) => (
              <span key={i} className="px-3 py-1 rounded-full text-sm bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                {skill}
                <button type="button" onClick={() => this.removeSkill(skill)} className="hover:text-red-400">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={newSkill} onChange={(e) => this.setState({ newSkill: e.target.value, saved: false })}
              onKeyPress={this.handleKeyPress} placeholder="Type skill and press Enter..."
              className="flex-1 bg-panel border border-main rounded-xl py-2 px-4 text-main placeholder-gray-500 focus:outline-none focus:border-blue-500" />
            <button type="button" onClick={this.addSkill} className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        <button type="submit" disabled={saving}
          className={`w-full py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
            saved ? 'bg-green-600 text-white' : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90'
          } ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}>
          {saving ? (
            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
          ) : saved ? (
            <><Check className="w-5 h-5" /> Saved!</>
          ) : (
            <><Save className="w-5 h-5" /> Save Changes</>
          )}
        </button>
      </form>
    );
  };

  renderCompanyForm = () => {
    const { fullName, email, about, activityType, location, phone, saved, saving } = this.state;

    return (
      <form onSubmit={this.handleSubmit} className="space-y-5">
        <div className="flex flex-col items-center mb-6">
          <div className="relative cursor-pointer group" onClick={this.handleImageClick}>
            {this.getAvatarDisplay()}
            <div className="absolute bottom-0 right-0 p-2 rounded-full bg-purple-600 text-white group-hover:scale-110 transition">
              <Camera className="w-4 h-4" />
            </div>
          </div>
          <input type="file" ref={this.fileInputRef} onChange={this.handleImageChange} accept="image/*" className="hidden" />
          <p className="text-gray-400 text-sm mt-2">Click to change logo</p>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Company Name *</label>
          <input type="text" name="fullName" value={fullName} onChange={this.handleChange} required
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500" />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Business Email *</label>
          <input type="email" name="email" value={email} onChange={this.handleChange} required
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500" />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">About Company</label>
          <textarea name="about" value={about} onChange={this.handleChange} rows="3"
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500 resize-none" />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Industry / Activity Type</label>
          <input type="text" name="activityType" value={activityType} onChange={this.handleChange}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500" />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Office Location</label>
          <input type="text" name="location" value={location} onChange={this.handleChange}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500" />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Phone Number</label>
          <input type="tel" name="phone" value={phone} onChange={this.handleChange}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500" />
        </div>

        <button type="submit" disabled={saving}
          className={`w-full py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
            saved ? 'bg-green-600 text-white' : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90'
          } ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}>
          {saving ? (
            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
          ) : saved ? (
            <><Check className="w-5 h-5" /> Saved!</>
          ) : (
            <><Save className="w-5 h-5" /> Save Changes</>
          )}
        </button>
      </form>
    );
  };

  render() {
    const { onBack, userType } = this.props;
    const { saved } = this.state;

    return (
      <div className="space-y-6">
        <button onClick={onBack} className="flex items-center gap-2 text-muted hover:text-main transition">
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-main">Edit {userType === 'worker' ? 'Profile' : 'Company'}</h2>
          {saved && <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">Changes saved</span>}
        </div>

        <div className="glass rounded-2xl p-6">
          {userType === 'worker' ? this.renderWorkerForm() : this.renderCompanyForm()}
        </div>

        {this.state.showAvatarCreator && (
          <DiceBearAvatarSelector 
            onClose={() => this.setState({ showAvatarCreator: false })}
            onSelect={this.handleAvatarSelect}
          />
        )}

        {this.state.showAISculptor && (
          <AIAvatarSculptor 
            currentName={this.state.fullName}
            onClose={() => this.setState({ showAISculptor: false })}
            onSelect={this.handleAvatarSelect}
          />
        )}
      </div>
    );
  }
}

export default Edit;