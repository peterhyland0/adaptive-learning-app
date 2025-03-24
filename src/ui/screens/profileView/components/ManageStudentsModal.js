import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch
} from 'react-native';
import { TextInput, Snackbar } from 'react-native-paper';
import AntDesign from 'react-native-vector-icons/AntDesign';
import COLORS from '../../../../constants/COLORS';
import { signUpUsers } from '../../../../api/signUpUsers';

export default class ManageStudentsModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      signUpForms: [
        {
          email: "",
          password: "",
          // username: "",
          admin: false,
          errorMessage: "",
          loading: false,
          visible: false,
        },
      ],
    };
  }

  // Update a specific field in the sign-up form at the given index.
  updateSignUpFormField = (index, field, value) => {
    const signUpForms = [...this.state.signUpForms];
    signUpForms[index][field] = value;
    this.setState({ signUpForms });
  };

  // Handles signing up a student.
  handleSignUpUser = async (index) => {
    const form = this.state.signUpForms[index];
    if (!form.email.trim() || !form.password.trim() ) {
      this.updateSignUpFormField(index, "errorMessage", "All fields are required.");
      this.updateSignUpFormField(index, "visible", true);
      return;
    }
    this.updateSignUpFormField(index, "loading", true);
    this.updateSignUpFormField(index, "errorMessage", "");
    try {
      // Assumes the admin UID is passed as a prop (from the parent).
      await signUpUsers(
        form.email,
        form.password,
        {
          // username: form.username,
          admin: form.admin,
          userUid: this.props.adminUid,
        }
      );
      // Reset the form on success.
      const signUpForms = [...this.state.signUpForms];
      signUpForms[index] = {
        email: "",
        password: "",
        // username: "",
        admin: false,
        errorMessage: "",
        loading: false,
        visible: false,
      };
      this.setState({ signUpForms });
      Alert.alert("Success", "Student signed up successfully.");
      // Trigger parent's callback to refresh the student list.
      if (this.props.onUserAdded) {
        this.props.onUserAdded();
      }
    } catch (error) {
      this.updateSignUpFormField(index, "loading", false);
      this.updateSignUpFormField(index, "errorMessage", "Sign up failed: " + error.message);
      this.updateSignUpFormField(index, "visible", true);
    }
  };

  // Adds another sign-up form.
  handleAddSignUpForm = () => {
    const { signUpForms } = this.state;
    this.setState({
      signUpForms: [
        ...signUpForms,
        {
          email: "",
          password: "",
          // username: "",
          admin: false,
          errorMessage: "",
          loading: false,
          visible: false,
        },
      ],
    });
  };

  // Removes a sign-up form.
  removeSignUpForm = (index) => {
    const { signUpForms } = this.state;
    const newForms = signUpForms.filter((_, i) => i !== index);
    this.setState({ signUpForms: newForms });
  };

  // Deletes a user via the API.
  removeUser = async (userUid) => {
    try {
      const response = await fetch(`http://0.0.0.0:8000/api/user/${userUid}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        Alert.alert("Success", "User deleted successfully.");
        // Notify parent to update the student list.
        if (this.props.onUserDeleted) {
          this.props.onUserDeleted(userUid);
        }
      } else {
        Alert.alert("Error", "Failed to delete user.");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      Alert.alert("Error", "An error occurred while deleting the user.");
    }
  };

  render() {
    const { students, onClose } = this.props;
    const { signUpForms } = this.state;

    return (
      <ScrollView style={{ flex: 1, padding: 20, backgroundColor: '#fff' }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Manage Students</Text>
          <TouchableOpacity onPress={onClose}>
            <AntDesign name="close" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {/* Current Students Section */}
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 10 }}>Current Students</Text>
        <View style={{ flexDirection: 'row', backgroundColor: '#f0f0f0', paddingVertical: 10 }}>
          <Text style={{ flex: 1, textAlign: 'center', fontWeight: 'bold' }}>UID</Text>
          <Text style={{ flex: 1, textAlign: 'center', fontWeight: 'bold' }}>Email</Text>
          {/*<Text style={{ flex: 1, textAlign: 'center', fontWeight: 'bold' }}>Username</Text>*/}
          <Text style={{ flex: 1, textAlign: 'center', fontWeight: 'bold' }}>Actions</Text>
        </View>
        {students && students.length > 0 ? (
          students.map(student => (
            <View key={student.uid} style={{ flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#ccc' }}>
              <Text style={{ flex: 1, textAlign: 'center' }}>{student.uid}</Text>
              <Text style={{ flex: 1, textAlign: 'center' }}>{student.email}</Text>
              {/*<Text style={{ flex: 1, textAlign: 'center' }}>{student.username}</Text>*/}
              <View style={{ flex: 1, alignItems: 'center' }}>
                <TouchableOpacity onPress={() => this.removeUser(student.uid)}>
                  <AntDesign name="deleteuser" size={20} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={{ textAlign: 'center', marginVertical: 10, color: '#666' }}>No students found.</Text>
        )}

        <View style={{ marginVertical: 20 }} />

        {/* Add New Student Section */}
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 10 }}>Add New Student</Text>
        {signUpForms.map((form, index) => (
          <View key={index} style={{ backgroundColor: COLORS.SPACE_GREY, padding: 20, borderRadius: 10, marginBottom: 20, position: 'relative' }}>
            <TouchableOpacity onPress={() => this.removeSignUpForm(index)} style={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }}>
              <Text style={{ fontSize: 18, color: COLORS.MAROON }}>X</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 20, marginBottom: 20, textAlign: 'center' }}>Sign Up Student #{index + 1}</Text>
            {/*<TextInput*/}
            {/*  label="Username"*/}
            {/*  mode="outlined"*/}
            {/*  value={form.username}*/}
            {/*  onChangeText={(text) => this.updateSignUpFormField(index, "username", text)}*/}
            {/*  style={{ marginBottom: 16 }}*/}
            {/*  theme={{ colors: { text: COLORS.MAROON, primary: COLORS.MAROON } }}*/}
            {/*/>*/}
            <TextInput
              label="Email"
              mode="outlined"
              value={form.email}
              onChangeText={(text) => this.updateSignUpFormField(index, "email", text)}
              style={{ marginBottom: 16 }}
              theme={{ colors: { text: COLORS.MAROON, primary: COLORS.MAROON } }}
            />
            <TextInput
              label="Password"
              mode="outlined"
              secureTextEntry
              value={form.password}
              onChangeText={(text) => this.updateSignUpFormField(index, "password", text)}
              style={{ marginBottom: 16 }}
              theme={{ colors: { text: COLORS.MAROON, primary: COLORS.MAROON } }}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 16, marginRight: 10, color: COLORS.MAROON }}>Admin User</Text>
              <Switch
                value={form.admin}
                onValueChange={(value) => this.updateSignUpFormField(index, "admin", value)}
                trackColor={{ false: "#767577", true: COLORS.MAROON }}
                thumbColor={form.admin ? "#fff" : "#f4f3f4"}
              />
            </View>
            {form.loading ? (
              <ActivityIndicator size="large" color={COLORS.MAROON} />
            ) : (
              <TouchableOpacity onPress={() => this.handleSignUpUser(index)} style={{ marginTop: 20, backgroundColor: COLORS.MAROON, alignItems: 'center', borderRadius: 25, padding: 10 }}>
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>Sign Up Student</Text>
              </TouchableOpacity>
            )}
            <Snackbar
              visible={form.visible}
              onDismiss={() => this.updateSignUpFormField(index, "visible", false)}
              duration={3000}
            >
              {form.errorMessage}
            </Snackbar>
          </View>
        ))}
        <TouchableOpacity onPress={this.handleAddSignUpForm} style={{ backgroundColor: COLORS.MAROON, alignItems: 'center', borderRadius: 25, padding: 10, marginBottom: 20 }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>+ Add Another</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }
}
